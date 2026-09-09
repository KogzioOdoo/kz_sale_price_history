from odoo import models, fields, tools


class StockRiskReport(models.Model):
    _name = "stock.risk.report"
    _description = "Stock Risk Analysis"
    _auto = False
    _rec_name = "product_id"

    product_id = fields.Many2one(
        "product.product",
        string="Product",
        readonly=True,
    )

    units_on_hand = fields.Float(
        string="Units On Hand",
        readonly=True,
    )

    sale_qty = fields.Float(
        string="Sale Quantity",
        readonly=True,
    )

    last_sold_date = fields.Datetime(
        string="Last Sold Date",
        readonly=True,
    )

    description = fields.Char(
        string="Description",
        readonly=True,
    )

    status = fields.Selection(
        [
            ("slow_mover", "Slow Mover"),
            ("dead_stock", "Dead Stock"),
            ("overstock_risk", "Overstock Risk"),
        ],
        string="Status",
        readonly=True,
    )

    def init(self):
        tools.drop_view_if_exists(self.env.cr, self._table)

        self.env.cr.execute("""
            CREATE OR REPLACE VIEW stock_risk_report AS (
                SELECT
                    pp.id AS id,
                    pp.id AS product_id,

                    COALESCE(stock.units_on_hand, 0) AS units_on_hand,

                    COALESCE(sales.sale_qty, 0) AS sale_qty,

                    sales.last_sold_date AS last_sold_date,

                    CASE
                        -- Dead Stock:
                        -- On hand > 0 and no sale/activity for 365+ days
                        WHEN COALESCE(stock.units_on_hand, 0) > 0
                             AND COALESCE(
                                    sales.last_sold_date::date,
                                    pt.create_date::date
                                 )
                                 <= CURRENT_DATE - INTERVAL '365 days'
                        THEN 'dead_stock'

                        -- Slow Mover:
                        -- On hand > 0 and no sale/activity for 30+ days
                        -- but less than 365 days
                        WHEN COALESCE(stock.units_on_hand, 0) > 0
                             AND COALESCE(
                                    sales.last_sold_date::date,
                                    pt.create_date::date
                                 )
                                 <= CURRENT_DATE - INTERVAL '30 days'
                             AND COALESCE(
                                    sales.last_sold_date::date,
                                    pt.create_date::date
                                 )
                                 > CURRENT_DATE - INTERVAL '365 days'
                        THEN 'slow_mover'

                        -- Overstock Risk:
                        -- On hand > 100 and sales are 1% or less
                        -- of the units currently on hand in the last 90 days
                        WHEN COALESCE(stock.units_on_hand, 0) > 100
                             AND COALESCE(sales.sale_qty, 0)
                                 <= COALESCE(stock.units_on_hand, 0) * 0.01
                        THEN 'overstock_risk'
                    END AS status,

                    CASE
                        -- Dead Stock description
                        WHEN COALESCE(stock.units_on_hand, 0) > 0
                             AND COALESCE(
                                    sales.last_sold_date::date,
                                    pt.create_date::date
                                 )
                                 <= CURRENT_DATE - INTERVAL '365 days'
                        THEN
                            'No sales for '
                            || (
                                CURRENT_DATE
                                - COALESCE(
                                    sales.last_sold_date::date,
                                    pt.create_date::date
                                )
                            )
                            || ' days'

                        -- Slow Mover description
                        WHEN COALESCE(stock.units_on_hand, 0) > 0
                             AND COALESCE(
                                    sales.last_sold_date::date,
                                    pt.create_date::date
                                 )
                                 <= CURRENT_DATE - INTERVAL '30 days'
                             AND COALESCE(
                                    sales.last_sold_date::date,
                                    pt.create_date::date
                                 )
                                 > CURRENT_DATE - INTERVAL '365 days'
                        THEN
                            'No sales for '
                            || (
                                CURRENT_DATE
                                - COALESCE(
                                    sales.last_sold_date::date,
                                    pt.create_date::date
                                )
                            )
                            || ' days'

                        -- Overstock Risk description
                        WHEN COALESCE(stock.units_on_hand, 0) > 100
                             AND COALESCE(sales.sale_qty, 0)
                                 <= COALESCE(stock.units_on_hand, 0) * 0.01
                        THEN
                            COALESCE(stock.units_on_hand, 0)::numeric
                            || ' units on hand and only '
                            || COALESCE(sales.sale_qty, 0)::numeric
                            || ' units sold in the last 90 days'
                    END AS description

                FROM product_product pp

                JOIN product_template pt
                    ON pt.id = pp.product_tmpl_id

                -- Aggregate stock first
                LEFT JOIN (
                    SELECT
                        sq.product_id,
                        SUM(sq.quantity) AS units_on_hand

                    FROM stock_quant sq

                    JOIN stock_location sl
                        ON sl.id = sq.location_id

                    WHERE sl.usage = 'internal'

                    GROUP BY sq.product_id
                ) stock
                    ON stock.product_id = pp.id

                -- Aggregate sales first
                LEFT JOIN (
                    SELECT
                        sol.product_id,

                        SUM(
                            CASE
                                WHEN so.date_order >=
                                     CURRENT_DATE - INTERVAL '90 days'
                                THEN sol.product_uom_qty
                                ELSE 0
                            END
                        ) AS sale_qty,

                        MAX(so.date_order) AS last_sold_date

                    FROM sale_order_line sol

                    JOIN sale_order so
                        ON so.id = sol.order_id

                    WHERE so.state IN ('sale', 'done')

                    GROUP BY sol.product_id
                ) sales
                    ON sales.product_id = pp.id

                -- Only consumable products
                WHERE pt.type = 'consu'

                -- Show only products belonging to
                -- one of the risk categories
                AND (
                    -- Dead Stock
                    (
                        COALESCE(stock.units_on_hand, 0) > 0
                        AND COALESCE(
                                sales.last_sold_date::date,
                                pt.create_date::date
                            )
                            <= CURRENT_DATE - INTERVAL '365 days'
                    )

                    OR

                    -- Slow Mover
                    (
                        COALESCE(stock.units_on_hand, 0) > 0
                        AND COALESCE(
                                sales.last_sold_date::date,
                                pt.create_date::date
                            )
                            <= CURRENT_DATE - INTERVAL '30 days'
                        AND COALESCE(
                                sales.last_sold_date::date,
                                pt.create_date::date
                            )
                            > CURRENT_DATE - INTERVAL '365 days'
                    )

                    OR

                    -- Overstock Risk
                    (
                        COALESCE(stock.units_on_hand, 0) > 100
                        AND COALESCE(sales.sale_qty, 0)
                            <= COALESCE(stock.units_on_hand, 0) * 0.01
                    )
                )
            )
        """)