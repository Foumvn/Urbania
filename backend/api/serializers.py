from rest_framework import serializers
from django.contrib.auth.models import User
from core.models import CerfaSession, Dossier, ActivityLog, AdminNotification

class UserSerializer(serializers.ModelSerializer):
    role = serializers.CharField(source='profile.role', read_only=True)
    lang = serializers.CharField(source='profile.lang', read_only=True)

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'role', 'lang')

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True)

    role = serializers.CharField(write_only=True, required=False)
    invite_code = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'confirm_password', 'first_name', 'last_name', 'role', 'invite_code')

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Cette adresse email est déjà associée à un compte.")
        return value

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Ce nom d'utilisateur est déjà utilisé.")
        return value

    def validate(self, data):
        if data['password'] != data['confirm_password']:
            raise serializers.ValidationError("Les mots de passe ne correspondent pas.")
        
        role = data.get('role')
        invite_code = data.get('invite_code')
        
        if role == 'admin':
            if invite_code != '1234533456':
                raise serializers.ValidationError("Code d'invitation administrateur invalide.")
        return data

    def create(self, validated_data):
        validated_data.pop('confirm_password')
        role = validated_data.pop('role', 'client')
        validated_data.pop('invite_code', None)
        
        # Ensure username exists
        if 'username' not in validated_data or not validated_data['username']:
            validated_data['username'] = validated_data['email']

        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', '')
        )
        
        # Update profile role using update() to avoid djongo ObjectId/int conversion issues
        from core.models import Profile
        Profile.objects.filter(user=user).update(role=role)
        
        # If no profile exists yet (emergency fallback), create it
        if not Profile.objects.filter(user=user).exists():
            Profile.objects.create(user=user, role=role)
            
        return user

class CerfaSessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = CerfaSession
        fields = ('data', 'current_step', 'updated_at')

class CerfaSessionAdminSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source='user.email', read_only=True)
    username = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = CerfaSession
        fields = ('id', 'username', 'user_email', 'data', 'current_step', 'created_at', 'updated_at')

class DossierSerializer(serializers.ModelSerializer):
    class Meta:
        model = Dossier
        fields = ('id', 'data', 'status', 'created_at', 'pdf_url')
        read_only_fields = ('id', 'created_at')

class ActivityLogSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)

    class Meta:
        model = ActivityLog
        fields = ('id', 'username', 'email', 'activity_type', 'details', 'ip_address', 'timestamp')

class AdminNotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = AdminNotification
        fields = '__all__'
