from fastapi import APIRouter

from .login import router as login_router
from .logout import router as logout_router

# from .posts import router as posts_router
from .rate_limits import router as rate_limits_router

# from .tasks import router as tasks_router
# from .tiers import router as tiers_router
from .users import router as users_router
from .projects import router as projects_router
from .workflow import router as workflows_router
from .form import router as forms_router
from .schedule import router as schedules_router
from .credential import router as credentials_router
from .webhook import router as webhook_router
from .executor import router as executor_router
from .template import router as template_router


router = APIRouter(prefix="/v1")
router.include_router(login_router)
router.include_router(logout_router)
router.include_router(users_router)
# router.include_router(posts_router)
# router.include_router(tasks_router)
# router.include_router(tiers_router)
router.include_router(rate_limits_router)
router.include_router(projects_router)
router.include_router(workflows_router)
router.include_router(forms_router)
router.include_router(schedules_router)
router.include_router(credentials_router)
router.include_router(webhook_router)
router.include_router(executor_router)
router.include_router(template_router)
