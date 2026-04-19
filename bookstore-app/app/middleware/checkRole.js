/**
 * Middleware для проверки роли пользователя (RBAC).
 * Роль читается из заголовка запроса: req.headers['user-role']
 *
 * @param {string[]} allowedRoles - массив ролей, которым разрешён доступ
 * @example
 *   router.get('/admin-only', checkRole(['admin']), controller.method);
 *   router.get('/all-roles',  checkRole(['admin', 'manager', 'cashier']), controller.method);
 */
const checkRole = (allowedRoles) => {
    return (req, res, next) => {
        const userRole = req.headers['user-role'];

        if (!userRole) {
            return res.status(401).json({
                message: 'Аутентификация не выполнена: заголовок user-role отсутствует.'
            });
        }

        if (!allowedRoles.includes(userRole)) {
            return res.status(403).json({
                message: `Доступ запрещён. Требуется одна из ролей: [${allowedRoles.join(', ')}]. Ваша роль: ${userRole}.`
            });
        }

        // Роль разрешена — передаём запрос дальше
        next();
    };
};

module.exports = checkRole;
