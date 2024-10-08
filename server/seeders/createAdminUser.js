const bcrypt = require('bcryptjs');
const User = require('../models/User'); // Ajusta la ruta a donde tengas el modelo de usuario

const createAdminUser = async () => {
    try {
        const adminEmail = 'admin@ejemplo.com'; // Cambia el correo según tus necesidades
        const adminPassword = 'admin1234'; // Cambia la contraseña del administrador

        // Busca si ya existe un administrador
        const existingAdmin = await User.findOne({ where: { email: adminEmail } });
        if (!existingAdmin) {
            const hashedPassword = await bcrypt.hash(adminPassword, 10);

            // Crea el administrador
            await User.create({
                email: adminEmail,
                password: hashedPassword,
                role: 'admin', // Asegura que el rol sea admin
            });

            console.log('Usuario administrador creado exitosamente.');
        } else {
            console.log('El administrador ya existe.');
        }
    } catch (error) {
        console.error('Error al crear el usuario administrador:', error);
    }
};
module.exports = createAdminUser;