from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from src.api.customer import auth as customer_auth, menus as customer_menus, orders as customer_orders
from src.api.admin import auth as admin_auth, orders as admin_orders, sse as admin_sse, menus as admin_menus, tables as admin_tables
from src.api.superadmin import auth as superadmin_auth, admins as superadmin_admins
from src.infrastructure.sse_publisher import setup_sse

app = FastAPI(title="TableOrder API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(customer_auth.router)
app.include_router(customer_menus.router)
app.include_router(customer_orders.router)
app.include_router(admin_auth.router)
app.include_router(admin_orders.router)
app.include_router(admin_sse.router)
app.include_router(admin_menus.router)
app.include_router(admin_tables.router)
app.include_router(superadmin_auth.router)
app.include_router(superadmin_admins.router)

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

@app.on_event("startup")
async def startup():
    await setup_sse()

@app.get("/")
async def root():
    return {"message": "TableOrder API is running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
