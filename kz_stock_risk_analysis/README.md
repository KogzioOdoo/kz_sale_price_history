# Stock Risk Analysis (kz_stock_risk_analysis)

Odoo 19 module that helps users identify and analyze inventory risk by reviewing stock quantities, recent sales activity, last sold dates, and dynamically calculated risk categories.

Compatible with Odoo 19 Community and Odoo 19 Enterprise.

## Features

- Dedicated Stock Risk Analysis view
- Identify products with inventory risk
- View the Product
- View Units On Hand
- View Sales Quantity from the last 90 days
- View the current Risk Status
- View a dynamically generated Description explaining the risk
- Identify Dead Stock products
- Identify Slow Mover products
- Identify Overstock Risk products
- Uses product creation date when no previous sale exists
- Calculates risk status dynamically based on current stock and sales data
- Considers only products of type `consu`
- Considers stock available in internal locations
- Considers confirmed and completed sales only
- Provides clear status badges for different risk categories
- Provides a dedicated reporting view for inventory analysis

## Risk Categories

### Dead Stock

A product is classified as **Dead Stock** when:

- Units On Hand is greater than `0`
- There has been no sales/activity for `365 days` or more

If the product has never been sold, the product creation date is used to determine how long the product has been inactive.

Example description:

> No sales for 420 days

### Slow Mover

A product is classified as a **Slow Mover** when:

- Units On Hand is greater than `0`
- There has been no sales/activity for `30 days` or more
- The inactivity period is less than `365 days`

If the product has never been sold, the product creation date is used instead.

Example description:

> No sales for 45 days

### Overstock Risk

A product is classified as Overstock Risk when:

Units On Hand is greater than 100
The quantity sold during the last 90 days is 1% or less of the current Units On Hand

The Overstock Risk calculation is based on:

Sales Quantity <= Units On Hand × 1%

For example:

90 units on hand → not considered Overstock Risk
101 units on hand and 1 unit sold → Overstock Risk
200 units on hand and 2 units sold → Overstock Risk
200 units on hand and 3 units sold → not Overstock Risk

Example description:

200 units on hand and only 2 units sold in the last 90 days

## Dependencies

- `base`
- `product`
- `stock`
- `sale`

## Installation

Place the `kz_stock_risk_analysis` module inside the Odoo `custom_addons` directory.

Make sure the `custom_addons` directory is included in your Odoo `addons_path`.

Restart the Odoo server.

Update the Apps list.

Search for **Stock Risk Analysis** and install the module.

Install (or upgrade) on each database where you need the feature:

```bash
odoo-bin -c odoo.conf -d YOUR_DB -i kz_stock_risk_analysis --stop-after-init

Or upgrade an existing installation:
```bash
odoo-bin -c odoo.conf -d YOUR_DB -u kz_stock_risk_analysis --stop-after-init

## Usage

Open the Inventory application and open Stock Risk Analysis.

The Stock Risk Analysis view displays products that belong to one of the configured inventory risk categories.

The view provides information about the product's current stock, recent sales activity, risk status, and a dynamically generated description.

## Stock Risk Analysis

The analysis view provides the following information:

Field	                                          Description
Product	                                  The product being analyzed
Units On Hand	                          Total quantity available in internal stock locations
Sale Quantity	                          Quantity sold during the last 90 days
Last Sold Date	                          Most recent confirmed/completed sales order date
Status	                                  The calculated inventory risk category
Description	                              Dynamic explanation of the identified inventory risk

## How It Works

The module uses a SQL-based reporting view to analyze inventory and sales information.

The report combines information from the following Odoo models:

product_product
product_template
stock_quant
stock_location
sale_order_line
sale_order

## Stock Calculation

The module retrieves stock quantities from stock_quant.

Only stock located in internal locations is considered:

WHERE sl.usage = 'internal'

The quantities are grouped by product to calculate the total Units On Hand.

## Sales Calculation

The module retrieves sales information from sales order lines and their corresponding sales orders.

Only confirmed and completed sales orders are considered:

WHERE so.state IN ('sale', 'done')

The module calculates:

Total quantity sold during the last 90 days
The latest sale date for the product

The latest sale date is obtained using:

MAX(so.date_order)

## Product Creation Date Fallback

When a product does not have any previous sales, there is no Last Sold Date available.

In this situation, the module uses the product creation date instead:

COALESCE(
    sales.last_sold_date::date,
    pt.create_date::date
)

This allows products with no sales history to still be classified.

For example, if a product was created 50 days ago and has never been sold, the module can identify it as a Slow Mover based on the product creation date.

If the product has existed for 365 days or more without any sale, it can be classified as Dead Stock.

## Dynamic Description

The Description field is generated dynamically based on the calculated risk condition.

For Dead Stock and Slow Mover products, the description shows the number of days since the last sale or, when there is no sales history, since the product was created.

Example:

No sales for 45 days

For Overstock Risk products, the description shows the current stock quantity and the quantity sold during the last 90 days.

Example:

200 units on hand and only 2 units sold in the last 90 days

The description is calculated directly from the current inventory and sales information.

## Risk Status Calculation

The module evaluates the following conditions:

Dead Stock:
Units On Hand > 0
AND
Last Sale / Product Creation Date >= 365 days ago

Slow Mover:
Units On Hand > 0
AND
Last Sale / Product Creation Date >= 30 days ago
AND
Last Sale / Product Creation Date < 365 days ago

Overstock Risk:
Units On Hand > 100
AND
Sales Quantity in the last 90 days <= Units On Hand × 1%

The status is dynamically calculated based on the current stock and sales data.

## Status Display

The report provides clear status indicators:

Dead Stock
Slow Mover
Overstock Risk

This allows users to quickly identify the type of inventory risk without manually analyzing the underlying values.

## Report View

The dedicated Stock Risk Analysis view allows users to review inventory risk information in one place.

The displayed columns are:

Product
Units On Hand
Status
Description

Only quantities stored in locations with:

usage = 'internal'

are included in the Units On Hand calculation.

This prevents stock from unrelated location types from affecting the risk analysis.

## Sales Order Status

Only sales orders with the following states are included:

sale
done

This ensures that confirmed/completed sales are used when calculating sales activity and the latest sale date.

## Compatibility

Odoo 19.0 — Community Edition and Enterprise Edition

Depends on:

base
product
stock
sale


Company: Kogzio Solutions

Email: info@kogzio.com

Website: https://www.kogzio.com/

## Notes

The module works with Odoo Inventory and Sales data.

The Stock Risk Analysis report is based on existing stock quantities and sales order records.

Only products of type consu are included in the analysis.

Only quantities from internal stock locations are considered.

Only confirmed/completed sales orders are considered for sales activity.

The report calculates sales quantity for the last 90 days.

The Last Sold Date is based on the most recent confirmed/completed sales order.

If a product has no previous sales, its product creation date is used as the activity date for Dead Stock and Slow Mover classification.

The risk status is calculated dynamically based on Units On Hand, sales activity, and the configured time/quantity thresholds.

The Description field dynamically explains the identified risk, such as the number of days since the last sale or the current stock and recent sales quantity.

The current risk categories are:

Dead Stock — no sales/activity for 365 days or more
Slow Mover — no sales/activity for 30 days or more but less than 365 days
Overstock Risk — more than 100 units on hand and sales during the last 90 days are 1% or less of the current Units On Hand

The report is implemented as a SQL view and is intended for inventory analysis and decision-making.


