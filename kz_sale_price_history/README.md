## Sales Price History (`kz_sale_price_history`)

Odoo 19 module that lets users view and review historical sales prices of products directly from sales order lines.

Compatible with Odoo 19 Community and Odoo 19 Enterprise.

## Features

- Price History button available from the Sales Order Line
- View previous sales prices for a product
- View the Sales Order Number
- View the Customer
- View the Unit Price
- View the Order Date
- Customer-specific filtering of price history
- Customer filter is applied by default based on the current sales order customer
- Remove the customer filter to view all previous prices for the selected product
- Access historical price information without leaving the sales workflow
- Provides a dedicated history view for reviewing previous sales prices

## Dependencies

`sale`

## Installation

Place the `kz_sale_price_history` module inside the Odoo `custom_addons` directory.

Make sure the `custom_addons` directory is included in your Odoo `addons_path`.

Restart the Odoo server.

Update the Apps list.

Search for **Sales Price History** and install the module.

Install (or upgrade) on each database where you need the feature:

```bash
odoo-bin -c odoo.conf -d YOUR_DB -i kz_sale_price_history --stop-after-init
# or
odoo-bin -c odoo.conf -d YOUR_DB -u kz_sale_price_history --stop-after-init
```
## Usage
Open Sales → Orders → Quotations or Sales Orders.
Open a sales order containing product lines.
Select a sales order line.
Click the Price History button.
The Sales Price History view displays previous sales price records for the selected product.
The Customer filter is applied by default based on the customer of the current sales order.
Remove the Customer filter to view all previous sales prices for the selected product across different customers.

## Sales Price History

The history view provides the following information:

 Field	                                Description
Sales Order Number	             The sales order from which the historical price was taken
Customer	                     The customer associated with the sales order
Unit Price	                     The unit selling price used in that sales order
Order Date	                     The date of the sales order

## How it works

When a product has been used in previous sales orders, the module retrieves the relevant sales order line information and makes the historical pricing available through the Price History button.

The history is based on existing sales order line records, so the displayed order number, customer, unit price, and order date come from the corresponding sales order and sales order line.

The Customer field is linked to the customer of the corresponding sales order.

When the Price History view is opened, the customer filter is automatically applied using the customer from the current sales order.

If the customer filter is removed, the history view displays all previous sales price records for the selected product regardless of customer.

## Price History View

The dedicated history view allows users to review previous prices in one place.

The displayed columns are:

Sales Order Number
Customer
Unit Price
Order Date

## Customer Filtering

The Price History view provides customer-specific filtering.

The customer filter is applied by default based on the customer of the current sales order.

For example, if the current sales order belongs to Eric, the history initially displays previous sales records for the selected product associated with Eric.

The customer filter can be removed manually to display the complete historical price records for the selected product across all customers.

## Compatibility

Odoo 19.0 — Community Edition and Enterprise Edition

Depends on: sale

## Support

Company: Kogzio Solutions

Email: info@kogzio.com

Website: https://www.kogzio.com/

## Notes
The module works with Odoo Sales.
Historical records are based on existing sales order lines.
Only confirmed sales orders are considered for historical price information.
The current sales order line is excluded from the price history.
The history displays Sales Order Number, Customer, Unit Price, and Order Date.
The Price History view is opened directly from the sales order line.
Customer-specific filtering is available in the Price History view.
The customer filter is applied by default based on the current sales order customer.
Removing the customer filter displays all available historical prices for the selected product.
The history view displays up to the latest 10 previous price records for the selected product.