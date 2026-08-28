from odoo import models,fields

class SaleOrderLine(models.Model):
    _inherit="sale.order.line"

    customer_id = fields.Many2one(
        "res.partner",
        related="order_id.partner_id",
        string="Customer",
    )
    order_date=fields.Datetime(
        related="order_id.date_order",
        string="Order Date"
    )

    def action_kz_sales_price_history(self):

        self.ensure_one()
        if not self.product_id:
            return False

        history_lines=self.search(
            [
                ("product_id","=",self.product_id.id),
                ("order_id.state","in",["sale","done"]),
                ("id","!=",self.id)
            ],order="order_date desc,id desc",limit=10
        )
        return {
            "type":"ir.actions.act_window",
            "name":"Price History",
            "res_model":"sale.order.line",
            "view_mode":"list",
            "views":[(self.env.ref("kz_sale_price_history.kz_sale_price_history_list_view").id,"list")],
            "search_view_id": self.env.ref(
            "kz_sale_price_history.kz_sale_price_history_search_view").id,

            "domain":[
                ("id","in",history_lines.ids)
            ],
            "context": {
                "default_customer_id": self.customer_id.id,
                "search_default_customer": 1,
            },
            "target":"new",
        }