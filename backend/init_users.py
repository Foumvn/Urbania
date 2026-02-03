import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'urbania_backend.settings')
django.setup()

from django.contrib.auth.models import User
from core.models import Profile

def create_user(username, email, password, role):
    user, created = User.objects.get_or_create(username=username, email=email)
    if created:
        user.set_password(password)
        user.save()
        print(f"User {username} created.")
    else:
        print(f"User {username} already exists.")
    
    # Update profile role using update() to avoid ObjectId issues
    Profile.objects.filter(user=user).update(role=role)
    print(f"Set role {role} for {username} via update().")

if __name__ == "__main__":
    # Admin user
    create_user('admin@urbania.fr', 'admin@urbania.fr', 'admin123', 'admin')
    
    # Client user
    create_user('client@urbania.fr', 'client@urbania.fr', 'client123', 'client')
    
    print("User initialization complete.")
