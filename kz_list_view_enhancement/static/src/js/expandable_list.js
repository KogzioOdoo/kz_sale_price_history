/** @odoo-module **/

import { ListRenderer } from "@web/views/list/list_renderer";
import { patch } from "@web/core/utils/patch";
import { useState, onWillStart } from "@odoo/owl";
import { useService } from "@web/core/utils/hooks";
import { parseXML } from "@web/core/utils/xml";

patch(ListRenderer.prototype, {
    setup() {
        super.setup(...arguments);

        this.orm = useService("orm");

        this.expandableState = useState({
            relations: [],
            selectedRelation: null,
            selectedFields: {},
            expandedRows: {},
            relatedRecords: {},
            loading: true,
        });

        onWillStart(async () => {
            await this.loadExpandableConfiguration();
            this.expandableState.loading = false;
        });
    },

    async loadExpandableConfiguration() {
        if (this.isX2Many) {
            return;
        }

        const model = this.props.list.resModel;

        if (!model) {
            return;
        }

        try {
            let formViewId = false;

            const formView = this.env.config.views?.find(
                ([viewId, viewType]) => viewType === "form"
            );

            if (formView) {
                formViewId = formView[0];
            }

            console.log("EXPAND DEBUG - VIEW", {
                model,
                actionId: this.env.config.actionId,
                views: this.env.config.views,
                formViewId,
            });

            /*
             * Get the form view through the model's normal
             * get_views() mechanism.
             *
             * We no longer use:
             * ir.ui.view.get_combined_arch()
             */
            console.log(
                "EXPAND DEBUG - BEFORE FORM GET VIEWS",
                {
                    model,
                    formViewId,
                    actionId: this.env.config.actionId,
                }
            );

            const parentViewResult = await this.orm.call(
                model,
                "get_views",
                [
                    [
                        [
                            formViewId || false,
                            "form",
                        ],
                    ],
                    {
                        action_id:
                            this.env.config.actionId || false,
                    },
                ],
                {
                    context: this.props.list.context || {},
                }
            );

            console.log(
                "EXPAND DEBUG - AFTER FORM GET VIEWS",
                {
                    model,
                    hasResult: !!parentViewResult,
                }
            );

            const formArch =
                parentViewResult?.views?.form?.arch || false;

            if (!formArch) {
                console.log(
                    "EXPAND DEBUG - NO FORM ARCH",
                    model
                );
                return;
            }

            const parsedFormArch = parseXML(formArch);

            const relations = [];

            const fieldNodes = Array.from(
                parsedFormArch.querySelectorAll("field[name]")
            ).filter(
                (fieldNode) =>
                    !fieldNode.parentElement.closest("field")
            );

            console.log(
                "EXPAND DEBUG - AFTER FORM ARCH PARSE",
                {
                    model,
                    fieldCount: fieldNodes.length,
                }
            );

            const modelFields =
                parentViewResult?.models?.[model]?.fields || {};

            for (const fieldNode of fieldNodes) {
                const fieldName =
                    fieldNode.getAttribute("name");

                const fieldInfo =
                    modelFields[fieldName];

                console.log("EXPAND DEBUG - FIELD", {
                    model,
                    fieldName,
                    type: fieldInfo?.type,
                });

                if (
                    !fieldInfo ||
                    fieldInfo.type !== "one2many"
                ) {
                    continue;
                }

                const invisible =
                    fieldNode.getAttribute("invisible");

                if (
                    invisible === "1" ||
                    invisible === "True" ||
                    invisible === "true"
                ) {
                    continue;
                }

                const relatedModel =
                    fieldInfo.relation;

                const relationField =
                    fieldInfo.relation_field;

                if (
                    !relatedModel ||
                    !relationField
                ) {
                    continue;
                }

                const listNode =
                    Array.from(fieldNode.children).find(
                        (child) =>
                            child.tagName === "list" ||
                            child.tagName === "tree"
                    );

                console.log(
                    "EXPAND DEBUG - RELATION",
                    {
                        model,
                        fieldName,
                        type: fieldInfo.type,
                        relatedModel,
                        relationField,
                        hasInlineList: !!listNode,
                    }
                );

                if (!listNode) {
                    continue;
                }

                console.log(
                    "EXPAND DEBUG - INLINE CHILD FIELDS",
                    Array.from(listNode.children)
                        .filter(
                            (node) =>
                                node.tagName === "field"
                        )
                        .map((node) => ({
                            name:
                                node.getAttribute("name"),
                            string:
                                node.getAttribute("string"),
                            optional:
                                node.getAttribute(
                                    "optional"
                                ),
                            invisible:
                                node.getAttribute(
                                    "invisible"
                                ),
                            columnInvisible:
                                node.getAttribute(
                                    "column_invisible"
                                ),
                        }))
                );

                const relatedModelFields =
                    await this.orm.call(
                        relatedModel,
                        "fields_get",
                        [],
                        {
                            attributes: [
                                "string",
                                "type",
                            ],
                            context:
                                this.props.list.context || {},
                        }
                    );

                const fields = [];
                const seenFields = new Set();

                for (
                    const childNode of Array.from(
                        listNode.children
                    )
                ) {
                    if (childNode.tagName !== "field") {
                        continue;
                    }

                    const childFieldName =
                        childNode.getAttribute("name");

                    if (
                        !childFieldName ||
                        seenFields.has(childFieldName)
                    ) {
                        continue;
                    }

                    const columnInvisible =
                        childNode.getAttribute(
                            "column_invisible"
                        );

                    const childInvisible =
                        childNode.getAttribute(
                            "invisible"
                        );

                    if (
                        columnInvisible === "1" ||
                        columnInvisible === "True" ||
                        columnInvisible === "true" ||
                        childInvisible === "1" ||
                        childInvisible === "True" ||
                        childInvisible === "true"
                    ) {
                        continue;
                    }

                    const childFieldInfo =
                        relatedModelFields[
                            childFieldName
                        ];

                    if (!childFieldInfo) {
                        continue;
                    }

                    seenFields.add(childFieldName);

                    fields.push({
                        name: childFieldName,
                        label:
                            childNode.getAttribute("string") ||
                            childFieldInfo.string,
                        type: childFieldInfo.type,
                    });
                }

                if (!fields.length) {
                    continue;
                }

                relations.push({
                    name: fieldName,
                    label: fieldInfo.string,
                    relatedModel,
                    relationField,
                    fields,
                });
            }

            this.expandableState.relations = relations;

            this.expandableState.selectedRelation =
                relations[0] || null;

            for (const relation of relations) {
                this.expandableState.selectedFields[
                    relation.name
                ] = relation.fields.map(
                    (field) => field.name
                );
            }

            console.log(
                "List View Enhancement: expandable relations",
                JSON.stringify(
                    relations,
                    null,
                    2
                )
            );
        } catch (error) {
            console.warn(
                "List View Enhancement: unable to detect expandable relations.",
                error
            );

            this.expandableState.relations = [];
            this.expandableState.selectedRelation = null;
        }
    },

    get hasExpandableRelations() {
        return (
            !this.expandableState.loading &&
            this.expandableState.relations.length > 0 &&
            !!this.expandableState.selectedRelation
        );
    },

    get expandableRelation() {
        return this.expandableState.selectedRelation;
    },

    isExpandableFieldSelected(field) {
        const relation = this.expandableRelation;

        if (!relation) {
            return false;
        }

        const selectedFields =
            this.expandableState.selectedFields[
                relation.name
            ] || [];

        return selectedFields.includes(field.name);
    },

    toggleExpandableField(fieldName) {
        const relation = this.expandableRelation;

        if (!relation) {
            return;
        }

        const selectedFields =
            this.expandableState.selectedFields[
                relation.name
            ] || [];

        if (selectedFields.includes(fieldName)) {
            this.expandableState.selectedFields[
                relation.name
            ] = selectedFields.filter(
                (name) => name !== fieldName
            );
        } else {
            this.expandableState.selectedFields[
                relation.name
            ] = [
                ...selectedFields,
                fieldName,
            ];
        }
    },

    get selectedExpandableFields() {
        const relation = this.expandableRelation;

        if (!relation) {
            return [];
        }

        const selectedFields =
            this.expandableState.selectedFields[
                relation.name
            ] || [];

        return relation.fields.filter(
            (field) =>
                selectedFields.includes(field.name)
        );
    },

    async toggleRow(record) {
        const recordId = record.resId;

        if (
            !recordId ||
            !this.expandableRelation
        ) {
            return;
        }

        if (
            this.expandableState.expandedRows[
                recordId
            ]
        ) {
            this.expandableState.expandedRows[
                recordId
            ] = false;

            return;
        }

        const relation = this.expandableRelation;

        this.expandableState.expandedRows[
            recordId
        ] = true;

        if (
            this.expandableState.relatedRecords[
                recordId
            ]
        ) {
            return;
        }

        const fields = relation.fields.map(
            (field) => field.name
        );

        try {
            const records = await this.orm.searchRead(
                relation.relatedModel,
                [
                    [
                        relation.relationField,
                        "=",
                        recordId,
                    ],
                ],
                fields
            );

            this.expandableState.relatedRecords[
                recordId
            ] = records;
        } catch (error) {
            console.error(
                "List View Enhancement: unable to load related records.",
                error
            );

            this.expandableState.relatedRecords[
                recordId
            ] = [];
        }
    },

    getRelatedFieldValue(record, field) {
        const value = record[field.name];

        if (
            value === false ||
            value === null ||
            value === undefined
        ) {
            return "";
        }

        if (
            field.type === "many2one" &&
            Array.isArray(value)
        ) {
            return value[1] || "";
        }

        if (
            field.type === "many2many" &&
            Array.isArray(value)
        ) {
            return value
                .map((item) =>
                    Array.isArray(item)
                        ? item[1]
                        : item
                )
                .join(", ");
        }

        if (field.type === "boolean") {
            return value ? "Yes" : "No";
        }

        return value;
    },
});