from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, func, cast, Date, text
from sqlalchemy.orm import Session

from app.database import get_db
from app.utils.auth import get_current_user, Authorization, check_if_user_blocked
from app.database.models import Warehouse, Rental, PremiumService, UserRole

revenue_router = APIRouter(prefix="/revenue", tags=["revenue"])

@revenue_router.get("/seller")
async def get_seller_revenue(
    time_range: str = "month",
    db: Session = Depends(get_db),
    user = Depends(Authorization(allowed_roles=[UserRole.SELLER]))
):
    check_if_user_blocked(user)
    
    # Calculate date range based on time_range parameter
    end_date = datetime.now()
    if time_range == "week":
        start_date = end_date - timedelta(days=7)
    elif time_range == "month":
        start_date = end_date - timedelta(days=30)
    elif time_range == "year":
        start_date = end_date - timedelta(days=365)
    else:
        raise HTTPException(status_code=400, detail="Invalid time range")

    # Get seller's warehouses
    warehouses_query = select(Warehouse).filter(Warehouse.owned_by == user.id)
    warehouses_result = await db.execute(warehouses_query)
    warehouses = warehouses_result.scalars().all()
    warehouse_ids = [w.id for w in warehouses]

    # Get total revenue
    total_revenue_query = select(func.sum(Rental.total_price)).filter(
        Rental.warehouse_id.in_(warehouse_ids),
        Rental.start_date >= start_date,
        Rental.start_date <= end_date
    )
    total_revenue_result = await db.execute(total_revenue_query)
    total_revenue = total_revenue_result.scalar() or 0

    # Get monthly revenue
    monthly_revenue_query = select(func.sum(Rental.total_price)).filter(
        Rental.warehouse_id.in_(warehouse_ids),
        Rental.start_date >= end_date - timedelta(days=30),
        Rental.start_date <= end_date
    )
    monthly_revenue_result = await db.execute(monthly_revenue_query)
    monthly_revenue = monthly_revenue_result.scalar() or 0

    # Get active rentals count
    active_rentals_query = select(func.count(Rental.id)).filter(
        Rental.warehouse_id.in_(warehouse_ids),
        Rental.start_date <= end_date,
        Rental.end_date >= end_date
    )
    active_rentals_result = await db.execute(active_rentals_query)
    active_rentals = active_rentals_result.scalar() or 0

    # Get revenue by warehouse
    revenue_by_warehouse_query = select(
        Warehouse.name.label('warehouse_name'),
        func.sum(Rental.total_price).label('revenue')
    ).join(
        Rental, Warehouse.id == Rental.warehouse_id
    ).filter(
        Warehouse.id.in_(warehouse_ids),
        Rental.start_date >= start_date,
        Rental.start_date <= end_date
    ).group_by(Warehouse.name)
    
    revenue_by_warehouse_result = await db.execute(revenue_by_warehouse_query)
    revenue_by_warehouse = [
        {"warehouse_name": row.warehouse_name, "revenue": float(row.revenue)}
        for row in revenue_by_warehouse_result
    ]

    # Get revenue by month using a raw SQL query for better PostgreSQL compatibility
    revenue_by_month_query = text("""
        SELECT 
            date_trunc('month', start_date)::date as month,
            SUM(total_price) as revenue
        FROM rentals
        WHERE warehouse_id = ANY(:warehouse_ids)
        AND start_date >= :start_date
        AND start_date <= :end_date
        GROUP BY date_trunc('month', start_date)::date
        ORDER BY month
    """)
    
    revenue_by_month_result = await db.execute(
        revenue_by_month_query,
        {
            "warehouse_ids": warehouse_ids,
            "start_date": start_date,
            "end_date": end_date
        }
    )
    revenue_by_month = [
        {"month": row.month.strftime("%B %Y"), "revenue": float(row.revenue)}
        for row in revenue_by_month_result
    ]

    # Get revenue by service using a raw SQL query
    revenue_by_service_query = text("""
        WITH service_revenue AS (
            SELECT 
                ps.name as service_name,
                ps.price as service_price,
                r.start_date
            FROM premium_services ps
            JOIN rentals r ON r.selected_services::jsonb @> jsonb_build_array(ps.id::text)
            WHERE r.warehouse_id = ANY(:warehouse_ids)
            AND r.start_date >= :start_date
            AND r.start_date <= :end_date
        )
        SELECT 
            service_name,
            SUM(service_price) as revenue
        FROM service_revenue
        GROUP BY service_name
        ORDER BY revenue DESC
    """)
    
    revenue_by_service_result = await db.execute(
        revenue_by_service_query,
        {
            "warehouse_ids": warehouse_ids,
            "start_date": start_date,
            "end_date": end_date
        }
    )
    revenue_by_service = [
        {"service_name": row.service_name, "revenue": float(row.revenue)}
        for row in revenue_by_service_result
    ]

    return {
        "total_revenue": float(total_revenue),
        "monthly_revenue": float(monthly_revenue),
        "active_rentals": active_rentals,
        "revenue_by_warehouse": revenue_by_warehouse,
        "revenue_by_month": revenue_by_month,
        "revenue_by_service": revenue_by_service
    } 