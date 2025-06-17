from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.resources.auth.resource import auth_router
from app.resources.rent.resource import rent_router
from app.resources.user.resource import user_router
from app.resources.locks.resource import locks_router
from app.resources.messages.resource import messages_router
from app.resources.warehouses.resource import warehouse_router
from app.resources.premium_services.resource import services_router
from app.resources.humidity.resource import humidity_router
from app.resources.backup.resource import backup_router
from app.resources.revenue.resource import revenue_router

app = FastAPI()

# # Configure CORS
# origins = [
#     "http://localhost:5173",  # Vite dev server
#     "http://localhost:3000",  # Alternative frontend port
#     "http://127.0.0.1:5173",
#     "http://127.0.0.1:3000",
# ]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=3600,  # Cache preflight requests for 1 hour
)

routers = [auth_router, warehouse_router, rent_router,
           user_router, services_router, locks_router, messages_router, humidity_router, backup_router, revenue_router]

for router in routers:
    app.include_router(router, prefix="/api")

# from app.database.fill_db import create_test_data


# create_test_data()