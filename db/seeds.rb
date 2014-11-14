puts 'Purging database...'
Mongoid.purge!
puts 'Creating a fake user account (username: `admin`, password: `password123`)'
User.create(name: 'admin',
            email: 'admin@admin.com',
            password: 'password123',
            password_confirmation: 'password123')
