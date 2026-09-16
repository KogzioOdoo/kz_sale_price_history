# List View Details

Enhance Odoo list views with flexible column management and expandable
related records.

## Features

### Column Swapping

-   Drag and drop columns directly from the list-view header.
-   Reorder columns according to your workflow.
-   Works across Odoo list views without module-specific `js_class`
    configuration.

### User-Specific Column Order

-   Each user's column arrangement is stored separately.
-   Different users can have different column orders for the same list
    view.
-   Your customized arrangement is restored when you return to the list
    view.

### List-View-Specific Preferences

-   Column order is associated with the current list view, not only the
    model.
-   Multiple list views for the same model can have independent
    arrangements.
-   New/current columns not present in a saved arrangement are
    automatically retained.

### Expandable Rows

-   Expand supported records directly from the list view.
-   View related records without opening the main record form.
-   The applicable related-record relationship is detected dynamically
    from the current model's form view.
-   Designed for list views whose records expose related line records.

### Related-Field Selection

-   Choose which related-record fields are displayed in the expanded
    area.
-   Select multiple fields at the same time.
-   Uses an Odoo-style settings/field-selection interface.
-   Keeps expanded information focused on what the user needs.

### Dynamic Related-Record Detection

-   Discovers applicable related-record fields from the form view used
    by the current model.
-   Reads the related model and available fields dynamically instead of
    hard-coding specific business models.
-   Makes the expandable mechanism reusable across different Odoo areas.

### User-Friendly Expanded Details

-   Related records are displayed in a compact mini-list below the
    selected record.
-   Inspect related information at a glance while staying on the main
    list.
-   Expand/collapse controls make additional information easy to show or
    hide.

## Why Use List View Details?

Odoo list views are useful for working with many records, but users may
need to rearrange columns, quickly inspect related records, choose only
the related fields they need, and avoid repeatedly opening individual
records.

**List View Details** brings these capabilities directly into the
list-view experience.

## How It Works

### Column Customization

``` text
Odoo List View
      ↓
Drag a column
      ↓
Drop it in the desired position
      ↓
Column order is saved for the user and list view
      ↓
The customized order is restored when the view is loaded again
```

### Expandable Related Records

``` text
Odoo List View
      ↓
Expand a record
      ↓
Related records are displayed
      ↓
Select the fields you want to see
```

## Technical Highlights

-   Built for Odoo 19.
-   Uses Odoo OWL `ListRenderer` for list-view enhancements.
-   Uses generic renderer patching so column swapping is available
    across list views.
-   Uses Odoo ORM services for server-side persistence.
-   Stores column preferences by user and list-view key.
-   Uses dynamic view metadata to discover supported related-record
    relationships.
-   Uses Odoo field metadata to obtain related-field labels and types.

## Installation

1.  Copy the `kz_list_view_enhancement` module into your Odoo custom
    addons directory.
2.  Make sure the custom addons path is included in your Odoo
    configuration.
3.  Restart the Odoo server.
4.  Update the Apps list if required.
5.  Install **List View Details** from the Odoo Apps menu.

## Usage

### Reorder Columns

1.  Open an Odoo list view.
2.  Drag a column header.
3.  Drop it at the required position.
4.  The customized order is saved for your user and that list view.

### View Related Records

1.  Open a list view containing records with supported related line
    records.
2.  Use the expand control on a record.
3.  Related records appear below the selected row.
4.  Use the field-selection control to choose the related fields to
    display.

## Compatibility

The column-swapping functionality is designed to work generically with
Odoo list views.

Expandable rows are available for list views where the current model's
form view exposes a suitable related-record relationship and inline list
definition.

## Module Structure

``` text
kz_list_view_enhancement/
├── models/
│   └── list_column_order.py
├── security/
│   └── ir.model.access.csv
├── static/
│   ├── description/
│   └── src/
│       ├── js/
│       └── xml/
├── views/
└── __manifest__.py
```

## Support

**Kogzio Solutions**

Website: https://www.kogzio.com/

Professional Odoo Apps