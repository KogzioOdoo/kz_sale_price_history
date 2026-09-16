# -*- coding: utf-8 -*-
# Copyright 2026 Kogzio Solutions
# License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl-3.0).

{
    'name': 'List View Details',
    'version': '19.0.1.0.0',
    'category': 'Extra Tools',
    'summary': 'Enhance Odoo list views with expandable records and column customization',

    'description': """
List View Details
=================

Enhance Odoo list views with interactive related-record details
and personalized column customization.

Key Features
------------

* Expandable Related Records
  Display related records directly underneath a parent record
  without opening the form view.

* Dynamic Related-Record Detection
  Automatically analyzes the form view associated with the current
  list view to identify applicable related-record relationships
  without requiring manual relationship configuration.

* Selectable Related Fields
  Select and display multiple fields from the related records
  using the field selection control inside the expanded section.

* Drag-and-Drop Column Swapping
  Reorder columns directly in Odoo list views using drag and drop.

* Global List View Support
  Column swapping works across Odoo list views without
  model-specific configuration.

* User-Specific Column Preferences
  Each user can maintain their own preferred column order.

* List-View-Specific Preferences
  Different list views can have independent column arrangements.

* Persistent Preferences
  Column arrangements are stored in Odoo and restored when
  the user opens the corresponding list view again.

The module is designed with reusable frontend functionality
and can be extended for additional Odoo list view use cases.

Compatible with Odoo 19 Community and Enterprise.

Contact: info@kogzio.com
Website: https://www.kogzio.com/
""",

    'author': 'Kogzio Solutions',
    'website': 'https://www.kogzio.com/',
    'license': 'LGPL-3',

    'depends': [
        'web',
        'sale',
    ],

    'data': [
        'security/ir.model.access.csv',
    ],

    'assets': {
        'web.assets_backend': [
            'kz_list_view_enhancement/static/src/js/column_swap.js',
            'kz_list_view_enhancement/static/src/js/expandable_list.js',
            'kz_list_view_enhancement/static/src/xml/expandable_list.xml',
            'kz_list_view_enhancement/static/src/css/expandable_list.css',
        ],
    },

    'images': [
        'static/description/banner.png',
    ],

    'installable': True,
    'application': True,
    'auto_install': False,
}