/** @odoo-module **/

import { ListRenderer } from "@web/views/list/list_renderer";
import { patch } from "@web/core/utils/patch";
import { useSortable } from "@web/core/utils/sortable_owl";
import { useService } from "@web/core/utils/hooks";
import { onWillStart, useState } from "@odoo/owl";

patch(ListRenderer.prototype, {
    setup() {
        super.setup(...arguments);

        this.orm = useService("orm");

        this.draggedColumn = null;

        this.columnOrder = useState({
            names: [],
            viewKey: null,
        });

        onWillStart(async () => {
            await this.loadColumnOrder();
        });

        useSortable({
            enable: () => true,
            ref: this.rootRef,

            // Only actual field headers.
            // This excludes checkbox and special columns.
            elements: "thead th[data-name]",

            cursor: "grabbing",

            onDragStart: ({ element }) => {
                this.draggedColumn =
                    this.getColumnFromElement(element);
            },

            onDragEnd: () => {
                this.draggedColumn = null;
            },

            onDrop: ({ previous, next }) => {
                if (!this.draggedColumn) {
                    return;
                }

                this.reorderColumns(
                    this.draggedColumn,
                    previous,
                    next
                );

                this.draggedColumn = null;
            },
        });
    },

    async loadColumnOrder() {
        try {
            /*
             * Odoo already provides a view key for identifying
             * the current list view.
             *
             * It is more reliable than using only the model name
             * because the same model can have multiple list views.
             */
            const viewKey = this.createViewKey();

            this.columnOrder.viewKey = viewKey;

            const savedOrder = await this.orm.call(
                "kz.list.column.order",
                "get_column_order",
                [viewKey]
            );

            if (Array.isArray(savedOrder)) {
                this.columnOrder.names = savedOrder;
            }
        } catch (error) {
            console.warn(
                "List View Enhancement: unable to load saved column order.",
                error
            );

            this.columnOrder.names = [];
        }
    },

    getColumnFromElement(element) {
        const columnName = element.dataset.name;

        return this.columns.find(
            (column) => column.name === columnName
        );
    },

    reorderColumns(
        draggedColumn,
        previousElement,
        nextElement
    ) {
        const columns = [...this.columns];

        const draggedIndex = columns.findIndex(
            (column) => column.id === draggedColumn.id
        );

        if (draggedIndex === -1) {
            return;
        }

        // Remove the dragged column from its old position.
        const [movedColumn] = columns.splice(
            draggedIndex,
            1
        );

        let targetIndex;

        if (nextElement) {
            const nextColumn =
                this.getColumnFromElement(nextElement);

            if (!nextColumn) {
                return;
            }

            targetIndex = columns.findIndex(
                (column) => column.id === nextColumn.id
            );
        } else if (previousElement) {
            const previousColumn =
                this.getColumnFromElement(previousElement);

            if (!previousColumn) {
                return;
            }

            targetIndex =
                columns.findIndex(
                    (column) => column.id === previousColumn.id
                ) + 1;
        } else {
            targetIndex = 0;
        }

        columns.splice(
            targetIndex,
            0,
            movedColumn
        );

        /*
         * Save field names instead of temporary column IDs.
         *
         * Example:
         * ["partner_id", "date_order", "amount_total"]
         */
        this.columnOrder.names = columns.map(
            (column) => column.name
        );

        this.saveColumnOrder();
    },

    async saveColumnOrder() {
        if (
            !this.columnOrder.viewKey ||
            !this.columnOrder.names.length
        ) {
            return;
        }

        try {
            await this.orm.call(
                "kz.list.column.order",
                "save_column_order",
                [
                    this.columnOrder.viewKey,
                    this.columnOrder.names,
                ]
            );
        } catch (error) {
            console.warn(
                "List View Enhancement: unable to save column order.",
                error
            );
        }
    },

    getActiveColumns() {
        const columns = super.getActiveColumns();

        if (!this.columnOrder.names.length) {
            return columns;
        }

        /*
         * First put columns in the user's saved order.
         */
        const orderedColumns =
            this.columnOrder.names
                .map((columnName) =>
                    columns.find(
                        (column) =>
                            column.name === columnName
                    )
                )
                .filter(Boolean);

        /*
         * Then append any new/current columns that were
         * not present when the user saved the order.
         */
        const remainingColumns = columns.filter(
            (column) =>
                !this.columnOrder.names.includes(
                    column.name
                )
        );

        return [
            ...orderedColumns,
            ...remainingColumns,
        ];
    },
});