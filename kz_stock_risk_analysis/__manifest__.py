# -*- coding: utf-8 -*-
# Copyright 2026 Kogzio Solutions
# License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl-3.0).


{
    'name': 'Stock Risk Analysis',
    'version': '19.0.1.0.0',
    'category': 'Extra Tools',
    'summary': 'Analyze products based on stock levels and sales movement',
    'description': """
Stock Risk Analysis
====================
Analyze products based on their current stock levels and sales movement.

The report identifies products under the following categories:

- Slow Mover
- Dead Stock
- Overstock Risk

The report displays:

- Product
- Units On Hand
- Description
- Status

Products are classified as:

- Slow Mover: No sales in the last 30 days.
- Dead Stock: No sales in the last 365 days.
- Overstock Risk: More than 100 units on hand and
  total quantity sold is 1% or less of the units on hand
  in the last 90 days.

Compatible with Odoo 19 Community and Enterprise.

Contact: info@kogzio.com
Website: https://www.kogzio.com/
""",
    'author': 'Kogzio Solutions',
    'website': 'https://www.kogzio.com/',
    'license': 'LGPL-3',
    'depends': [
        'stock',
        'sale','product'
    ],
    'data': [
        'security/ir.model.access.csv',
        'views/stock_risk_report_views.xml',
        'views/stock_risk_menu.xml',
    ],
    'images': [
        'static/description/banner.png',
        'static/description/banner2.png',
    ],
    'installable': True,
    'application': True,
    'auto_install': False,
}