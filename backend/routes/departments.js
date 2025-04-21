const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/auth');
const {
    getDepartments,
    getDepartment,
    createDepartment,
    updateDepartment,
    deleteDepartment,
    getDepartmentMembers,
    getDepartmentStats
} = require('../controllers/departmentController');

router.use(protect);

router.route('/')
    .get(getDepartments)
    .post(authorize('admin'), createDepartment);

router.get('/stats', authorize('admin'), getDepartmentStats);

router.route('/:id')
    .get(getDepartment)
    .put(authorize('admin'), updateDepartment)
    .delete(authorize('admin'), deleteDepartment);

router.get('/:id/members', getDepartmentMembers);

module.exports = router;
