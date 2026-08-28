# -*- coding: utf-8 -*-
# Copyright 2026 Kogzio Solutions
# License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl-3.0).

{
    'name': 'Sales Price History',
    'version': '19.0.1.0.0',
    'category': 'Extra Tools',
    'summary': 'View historical sales prices from previous sales orders',
    'description': """
Sales Price History
===================
View and review historical sales prices of products directly from
sales order lines.

The history view displays:

- Sales Order Number
- Customer
- Unit Price
- Order Date


Compatible with Odoo 19 Community and Enterprise.

Contact: info@kogzio.com
Website: https://www.kogzio.com/
""",
    'author': 'Kogzio Solutions',
    'website': 'https://www.kogzio.com/',
    'license': 'LGPL-3',
    'depends': [
        'sale',
    ],
    'data': [
        'views/sale_price_history_views.xml',
    ],
    'installable': True,
    'application': True,
    'auto_install': False,
    'images': [
        'static/description/banner2.png',
    ],
}