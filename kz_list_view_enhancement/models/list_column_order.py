from odoo import fields, models,api
from odoo.exceptions import ValidationError


class ListColumnOrder(models.Model):
    _name = "kz.list.column.order"
    _description = "User List Column Order"

    user_id = fields.Many2one(
        "res.users",
        string="User",
        required=True,
        default=lambda self: self.env.user,
        ondelete="cascade",
        index=True,
    )

    view_key = fields.Char(
        string="View Key",
        required=True,
        index=True,
    )

    column_order = fields.Json(
        string="Column Order",
        required=True,
        default=lambda: [],
    )

    _user_view_unique = models.Constraint(
        "UNIQUE(user_id, view_key)",
        "A column order already exists for this user and view.",
    )

    @api.model
    def get_column_order(self, view_key):
        record = self.search(
            [
                ("user_id", "=", self.env.user.id),
                ("view_key", "=", view_key),
            ],
            limit=1,
        )

        return record.column_order if record else []

    @api.model
    def save_column_order(self, view_key, column_order):
        if not view_key:
            return False

        if not isinstance(column_order, list):
            raise ValidationError(
                "Column order must be a list."
            )

        if not all(
            isinstance(column, str)
            for column in column_order
        ):
            raise ValidationError(
                "Column names must be strings."
            )

        record = self.search(
            [
                ("user_id", "=", self.env.user.id),
                ("view_key", "=", view_key),
            ],
            limit=1,
        )

        values = {
            "column_order": column_order,
        }

        if record:
            record.write(values)
        else:
            self.create(
                {
                    "user_id": self.env.user.id,
                    "view_key": view_key,
                    "column_order": column_order,
                }
            )

        return True