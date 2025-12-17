from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import (
    EducationalContent, UserProgress, LearningPath, LearningPathContent,
    LearningPathEnrollment, ContentCompletion, Certificate, SavingsChallenge,
    ChallengeParticipant, Webinar, WebinarRegistration, WebinarQnA,
    WebinarPoll, WebinarPollResponse, Achievement, UserAchievement
)


User = get_user_model()


class UserSimpleSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name', 'profile_picture']


# Educational Content
class EducationalContentSerializer(serializers.ModelSerializer):
    author = UserSimpleSerializer(read_only=True)
    prerequisites = serializers.SerializerMethodField()
    is_completed = serializers.SerializerMethodField()
    user_progress = serializers.SerializerMethodField()
    
    class Meta:
        model = EducationalContent
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at', 'published_at', 'author']
    
    def get_prerequisites(self, obj):
        return [{'id': p.id, 'title': p.title, 'slug': p.slug} for p in obj.prerequisites.all()]
    
    def get_is_completed(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.user_progress.filter(user=request.user, status='COMPLETED').exists()
        return False
    
    def get_user_progress(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            progress = obj.user_progress.filter(user=request.user).first()
            if progress:
                return UserProgressSerializer(progress).data
        return None


class EducationalContentCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = EducationalContent
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at', 'author', 'views_count']


# User Progress
class UserProgressSerializer(serializers.ModelSerializer):
    content = EducationalContentSerializer(read_only=True)
    user = UserSimpleSerializer(read_only=True)
    
    class Meta:
        model = UserProgress
        fields = '__all__'
        read_only_fields = ['id', 'user', 'started_at', 'completed_at']


class UserProgressCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProgress
        fields = ['content', 'progress_percentage', 'quiz_score', 'quiz_answers', 'bookmarked', 'last_position']


# Learning Paths
class LearningPathContentSerializer(serializers.ModelSerializer):
    content = EducationalContentSerializer(read_only=True)
    
    class Meta:
        model = LearningPathContent
        fields = ['id', 'content', 'order', 'is_required']


class LearningPathSerializer(serializers.ModelSerializer):
    contents = serializers.SerializerMethodField()
    path_contents = LearningPathContentSerializer(many=True, read_only=True)
    is_enrolled = serializers.SerializerMethodField()
    user_enrollment = serializers.SerializerMethodField()
    
    class Meta:
        model = LearningPath
        fields = '__all__'
    
    def get_contents(self, obj):
        return LearningPathContentSerializer(
            obj.path_contents.order_by('order'), 
            many=True, 
            context=self.context
        ).data
    
    def get_is_enrolled(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.enrollments.filter(user=request.user).exists()
        return False
    
    def get_user_enrollment(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            enrollment = obj.enrollments.filter(user=request.user).first()
            if enrollment:
                return LearningPathEnrollmentSerializer(enrollment, context=self.context).data
        return None


class LearningPathCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = LearningPath
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']


# Learning Path Enrollment
class ContentCompletionSerializer(serializers.ModelSerializer):
    content = EducationalContentSerializer(read_only=True)
    
    class Meta:
        model = ContentCompletion
        fields = '__all__'
        read_only_fields = ['id', 'completed_at']


class LearningPathEnrollmentSerializer(serializers.ModelSerializer):
    learning_path = LearningPathSerializer(read_only=True)
    user = UserSimpleSerializer(read_only=True)
    current_content = EducationalContentSerializer(read_only=True)
    completions = ContentCompletionSerializer(many=True, read_only=True)
    
    class Meta:
        model = LearningPathEnrollment
        fields = '__all__'
        read_only_fields = ['id', 'enrollment_id', 'user', 'learning_path', 'enrolled_at', 
                          'started_at', 'completed_at', 'last_accessed_at']


class LearningPathEnrollmentCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = LearningPathEnrollment
        fields = ['learning_path', 'notes']


# Certificates
class CertificateSerializer(serializers.ModelSerializer):
    user = UserSimpleSerializer(read_only=True)
    learning_path = LearningPathSerializer(read_only=True)
    content = EducationalContentSerializer(read_only=True)
    
    class Meta:
        model = Certificate
        fields = '__all__'
        read_only_fields = ['id', 'certificate_id', 'issued_at', 'verification_code']


# Savings Challenges
class SavingsChallengeSerializer(serializers.ModelSerializer):
    created_by = UserSimpleSerializer(read_only=True)
    learning_path = LearningPathSerializer(read_only=True)
    educational_content = EducationalContentSerializer(many=True, read_only=True)
    is_participating = serializers.SerializerMethodField()
    user_participation = serializers.SerializerMethodField()
    
    class Meta:
        model = SavingsChallenge
        fields = '__all__'
        read_only_fields = ['id', 'created_by', 'created_at', 'total_amount_saved', 'success_rate']
    
    def get_is_participating(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.participants.filter(user=request.user).exists()
        return False
    
    def get_user_participation(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            participation = obj.participants.filter(user=request.user).first()
            if participation:
                return ChallengeParticipantSerializer(participation, context=self.context).data
        return None


class SavingsChallengeCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = SavingsChallenge
        fields = '__all__'
        read_only_fields = ['id', 'created_by', 'created_at', 'participants_count']


# Challenge Participants
class ChallengeParticipantSerializer(serializers.ModelSerializer):
    challenge = SavingsChallengeSerializer(read_only=True)
    user = UserSimpleSerializer(read_only=True)
    completed_lessons = EducationalContentSerializer(many=True, read_only=True)
    
    class Meta:
        model = ChallengeParticipant
        fields = '__all__'
        read_only_fields = ['id', 'joined_at', 'started_at', 'completed_at', 'last_activity_at']


class ChallengeParticipantCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChallengeParticipant
        fields = ['challenge', 'daily_target', 'weekly_target', 'notes']


# Webinars
class WebinarSerializer(serializers.ModelSerializer):
    presenter = UserSimpleSerializer(read_only=True)
    co_presenters = UserSimpleSerializer(many=True, read_only=True)
    learning_path = LearningPathSerializer(read_only=True)
    related_content = EducationalContentSerializer(many=True, read_only=True)
    
    is_registered = serializers.SerializerMethodField()
    user_registration = serializers.SerializerMethodField()
    can_register = serializers.SerializerMethodField()
    time_until_start = serializers.SerializerMethodField()
    
    class Meta:
        model = Webinar
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at', 'views_count', 'average_rating']
    
    def get_is_registered(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.registrations.filter(user=request.user, status__in=['REGISTERED', 'ATTENDED']).exists()
        return False
    
    def get_user_registration(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            registration = obj.registrations.filter(user=request.user).first()
            if registration:
                return WebinarRegistrationSerializer(registration, context=self.context).data
        return None
    
    def get_can_register(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            # Check if user is already registered
            if obj.registrations.filter(user=request.user).exists():
                return False
            # Check if webinar is full
            if obj.registered_count >= obj.max_participants:
                return False
            # Check if webinar is in the future
            from django.utils import timezone
            return obj.scheduled_at > timezone.now() and obj.status == 'SCHEDULED'
        return False
    
    def get_time_until_start(self, obj):
        from django.utils import timezone
        if obj.scheduled_at > timezone.now():
            delta = obj.scheduled_at - timezone.now()
            days = delta.days
            hours = delta.seconds // 3600
            minutes = (delta.seconds % 3600) // 60
            return f"{days}d {hours}h {minutes}m"
        return "Started"


class WebinarCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Webinar
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at', 'registered_count', 'attended_count']


# Webinar Registrations
class WebinarRegistrationSerializer(serializers.ModelSerializer):
    webinar = WebinarSerializer(read_only=True)
    user = UserSimpleSerializer(read_only=True)
    
    class Meta:
        model = WebinarRegistration
        fields = '__all__'
        read_only_fields = ['id', 'registration_id', 'user', 'webinar', 'registered_at', 
                          'joined_at', 'left_at', 'checkin_at', 'feedback_at']


class WebinarRegistrationCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = WebinarRegistration
        fields = ['webinar', 'timezone', 'notes']


# Webinar Q&A
class WebinarQnASerializer(serializers.ModelSerializer):
    user = UserSimpleSerializer(read_only=True)
    answered_by = UserSimpleSerializer(read_only=True)
    
    class Meta:
        model = WebinarQnA
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'answered_at']


# Webinar Polls
class WebinarPollSerializer(serializers.ModelSerializer):
    created_by = UserSimpleSerializer(read_only=True)
    has_responded = serializers.SerializerMethodField()
    response_count = serializers.SerializerMethodField()
    
    class Meta:
        model = WebinarPoll
        fields = '__all__'
        read_only_fields = ['id', 'created_at']
    
    def get_has_responded(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.responses.filter(user=request.user).exists()
        return False
    
    def get_response_count(self, obj):
        return obj.responses.count()


class WebinarPollResponseSerializer(serializers.ModelSerializer):
    poll = WebinarPollSerializer(read_only=True)
    user = UserSimpleSerializer(read_only=True)
    
    class Meta:
        model = WebinarPollResponse
        fields = '__all__'
        read_only_fields = ['id', 'submitted_at']


# Achievements
class AchievementSerializer(serializers.ModelSerializer):
    is_unlocked = serializers.SerializerMethodField()
    user_progress = serializers.SerializerMethodField()
    
    class Meta:
        model = Achievement
        fields = '__all__'
        read_only_fields = ['id', 'created_at']
    
    def get_is_unlocked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.user_achievements.filter(user=request.user, is_unlocked=True).exists()
        return False
    
    def get_user_progress(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            user_achievement = obj.user_achievements.filter(user=request.user).first()
            if user_achievement:
                return UserAchievementSerializer(user_achievement, context=self.context).data
        return None


class UserAchievementSerializer(serializers.ModelSerializer):
    achievement = AchievementSerializer(read_only=True)
    user = UserSimpleSerializer(read_only=True)
    
    class Meta:
        model = UserAchievement
        fields = '__all__'
        read_only_fields = ['id', 'earned_at']


# Dashboard and Analytics Serializers
class LearningStatsSerializer(serializers.Serializer):
    total_contents_completed = serializers.IntegerField()
    total_points_earned = serializers.IntegerField()
    total_time_spent_minutes = serializers.IntegerField()
    active_enrollments = serializers.IntegerField()
    certificates_earned = serializers.IntegerField()
    achievements_unlocked = serializers.IntegerField()
    
    # Weekly/Monthly progress
    weekly_progress = serializers.ListField(child=serializers.DictField())
    monthly_progress = serializers.ListField(child=serializers.DictField())
    
    # Category breakdown
    category_breakdown = serializers.ListField(child=serializers.DictField())
    
    # Recent activity
    recent_activity = serializers.ListField(child=serializers.DictField())


class WebinarStatsSerializer(serializers.Serializer):
    total_webinars_attended = serializers.IntegerField()
    total_webinars_registered = serializers.IntegerField()
    average_attendance_rate = serializers.FloatField()
    upcoming_webinars = serializers.ListField(child=serializers.DictField())
    recent_webinars = serializers.ListField(child=serializers.DictField())


class ChallengeStatsSerializer(serializers.Serializer):
    total_challenges_participated = serializers.IntegerField()
    total_amount_saved = serializers.DecimalField(max_digits=12, decimal_places=2)
    challenges_completed = serializers.IntegerField()
    success_rate = serializers.FloatField()
    active_challenges = serializers.ListField(child=serializers.DictField())


# Quiz Submission Serializer
class QuizSubmissionSerializer(serializers.Serializer):
    content_id = serializers.IntegerField()
    answers = serializers.JSONField()
    time_spent_minutes = serializers.IntegerField(default=0)
    
    def validate(self, data):
        content_id = data.get('content_id')
        answers = data.get('answers')
        
        # Validate that content exists and is a quiz
        try:
            content = EducationalContent.objects.get(id=content_id)
            if content.content_type != 'QUIZ':
                raise serializers.ValidationError("Content is not a quiz")
        except EducationalContent.DoesNotExist:
            raise serializers.ValidationError("Content does not exist")
        
        return data