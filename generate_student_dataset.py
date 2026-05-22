import random
import csv

# Set random seed for reproducibility
random.seed(42)

# Define the feature columns based on requirements
FEATURES = [
    # A. Academic Performance / History
    'academic_consistency',
    'gpa_trend',
    'subject_mastery_level',
    'exam_performance_consistency',
    
    # B. Learning Behavior
    'study_habits_consistency',
    'lms_engagement_level',
    'assignment_completion_rate',
    'self_learning_initiative',
    
    # C. Instructor Interaction
    'class_participation',
    'responsiveness_to_feedback',
    'consultation_frequency',
    
    # D. Classmate / Peer Influence
    'group_study_participation',
    'peer_collaboration_quality',
    'academic_peer_environment_strength',
    
    # E. Course / Program Experience
    'adaptation_to_course_difficulty',
    'engagement_in_program_activities',
    'skill_development_alignment',
    
    # F. Financial Factors (RISK INDICATORS - reversed scoring)
    'financial_stability',
    'scholarship_support_level',
    
    # G. Personal Factors (RISK INDICATORS - stress uses reverse scoring)
    'motivation_level',
    'stress_level',  # Will be reversed: high stress = 1, low stress = 4
    'time_management_skills',
]

def generate_at_risk_student(student_id, risk_type):
    """
    Generate a student with specific at-risk characteristics.
    risk_type: 'financial', 'personal', 'academic'
    """
    record = {
        'student_id': student_id,
        'name': f'Student {student_id} ({risk_type.title()} Risk)',
        'course': random.choice(['BSCS', 'BSIT', 'BLIS', 'BSA']),
        'department': 'CCIS',
        'year': random.randint(1, 4),
        'email': f'student{student_id}@university.edu',
    }
    
    if risk_type == 'financial':
        # Financial at-risk: poor financial stability, no scholarship
        record['academic_consistency'] = round(random.uniform(2, 3), 1)
        record['gpa_trend'] = round(random.uniform(1.5, 2.5), 1)
        record['subject_mastery_level'] = round(random.uniform(2, 3), 1)
        record['exam_performance_consistency'] = round(random.uniform(2, 3), 1)
        record['study_habits_consistency'] = round(random.uniform(2, 3), 1)
        record['lms_engagement_level'] = round(random.uniform(2, 3), 1)
        record['assignment_completion_rate'] = round(random.uniform(1.5, 2.5), 1)
        record['self_learning_initiative'] = round(random.uniform(1.5, 2.5), 1)
        record['class_participation'] = round(random.uniform(2, 3), 1)
        record['responsiveness_to_feedback'] = round(random.uniform(2, 3), 1)
        record['consultation_frequency'] = round(random.uniform(1, 2), 1)
        record['group_study_participation'] = round(random.uniform(1, 2), 1)
        record['peer_collaboration_quality'] = round(random.uniform(1, 2), 1)
        record['academic_peer_environment_strength'] = round(random.uniform(1, 2), 1)
        record['adaptation_to_course_difficulty'] = round(random.uniform(1.5, 2.5), 1)
        record['engagement_in_program_activities'] = round(random.uniform(1, 2), 1)
        record['skill_development_alignment'] = round(random.uniform(1.5, 2.5), 1)
        # Financial factors - POOR
        record['financial_stability'] = round(random.uniform(1, 1.5), 1)  # Very low
        record['scholarship_support_level'] = 1.0  # No scholarship
        # Personal factors - moderate
        record['motivation_level'] = round(random.uniform(2, 3), 1)
        record['stress_level'] = round(random.uniform(2, 3), 1)
        record['time_management_skills'] = round(random.uniform(2, 3), 1)
        record['risk_label'] = 2  # High Risk
        
    elif risk_type == 'personal':
        # Personal at-risk: high stress, poor time management, low motivation
        record['academic_consistency'] = round(random.uniform(2, 3), 1)
        record['gpa_trend'] = round(random.uniform(1.5, 2.5), 1)
        record['subject_mastery_level'] = round(random.uniform(2, 3), 1)
        record['exam_performance_consistency'] = round(random.uniform(2, 3), 1)
        record['study_habits_consistency'] = round(random.uniform(1, 2), 1)
        record['lms_engagement_level'] = round(random.uniform(1, 2), 1)
        record['assignment_completion_rate'] = round(random.uniform(1, 2), 1)
        record['self_learning_initiative'] = round(random.uniform(1, 2), 1)
        record['class_participation'] = round(random.uniform(1, 2), 1)
        record['responsiveness_to_feedback'] = round(random.uniform(1, 2), 1)
        record['consultation_frequency'] = round(random.uniform(1, 2), 1)
        record['group_study_participation'] = round(random.uniform(1, 2), 1)
        record['peer_collaboration_quality'] = round(random.uniform(1, 2), 1)
        record['academic_peer_environment_strength'] = round(random.uniform(1, 2), 1)
        record['adaptation_to_course_difficulty'] = round(random.uniform(1.5, 2.5), 1)
        record['engagement_in_program_activities'] = round(random.uniform(1, 2), 1)
        record['skill_development_alignment'] = round(random.uniform(1.5, 2.5), 1)
        # Financial factors - moderate
        record['financial_stability'] = round(random.uniform(2, 3), 1)
        record['scholarship_support_level'] = round(random.uniform(2, 3), 1)
        # Personal factors - POOR
        record['motivation_level'] = round(random.uniform(1, 1.5), 1)  # Very low
        record['stress_level'] = round(random.uniform(1, 1.5), 1)  # Very high stress (reversed)
        record['time_management_skills'] = round(random.uniform(1, 1.5), 1)  # Very poor
        record['risk_label'] = 2  # High Risk
        
    elif risk_type == 'academic':
        # Academic at-risk: poor academic performance, low engagement
        record['academic_consistency'] = round(random.uniform(1, 1.5), 1)  # Very low
        record['gpa_trend'] = round(random.uniform(1, 1.5), 1)  # Declining
        record['subject_mastery_level'] = round(random.uniform(1, 1.5), 1)  # Very low
        record['exam_performance_consistency'] = round(random.uniform(1, 1.5), 1)  # Very low
        record['study_habits_consistency'] = round(random.uniform(1, 1.5), 1)  # Very poor
        record['lms_engagement_level'] = round(random.uniform(1, 1.5), 1)  # Very low
        record['assignment_completion_rate'] = round(random.uniform(1, 1.5), 1)  # Very low
        record['self_learning_initiative'] = round(random.uniform(1, 1.5), 1)  # Very low
        record['class_participation'] = round(random.uniform(1, 1.5), 1)  # Very low
        record['responsiveness_to_feedback'] = round(random.uniform(1, 1.5), 1)  # Very low
        record['consultation_frequency'] = round(random.uniform(1, 1.5), 1)  # Very low
        record['group_study_participation'] = round(random.uniform(1, 1.5), 1)  # Very low
        record['peer_collaboration_quality'] = round(random.uniform(1, 1.5), 1)  # Very low
        record['academic_peer_environment_strength'] = round(random.uniform(1, 1.5), 1)  # Very low
        record['adaptation_to_course_difficulty'] = round(random.uniform(1, 1.5), 1)  # Very poor
        record['engagement_in_program_activities'] = round(random.uniform(1, 1.5), 1)  # Very low
        record['skill_development_alignment'] = round(random.uniform(1, 1.5), 1)  # Very poor
        # Financial factors - moderate
        record['financial_stability'] = round(random.uniform(2, 3), 1)
        record['scholarship_support_level'] = round(random.uniform(2, 3), 1)
        # Personal factors - moderate
        record['motivation_level'] = round(random.uniform(2, 3), 1)
        record['stress_level'] = round(random.uniform(2, 3), 1)
        record['time_management_skills'] = round(random.uniform(2, 3), 1)
        record['risk_label'] = 2  # High Risk
    
    # Add legacy fields
    record['study_hours'] = random.randint(1, 5)
    record['library_visits'] = random.randint(0, 5)
    record['scholarship'] = 'no' if risk_type == 'financial' else random.choice(['yes', 'no'])
    record['scholarship_amount'] = 0 if risk_type == 'financial' else (random.randint(0, 50000) if record['scholarship'] == 'yes' else 0)
    record['family_income'] = random.randint(5000, 30000) if risk_type == 'financial' else random.randint(10000, 100000)
    record['lms_login_per_month'] = random.randint(0, 10)
    record['status'] = 'active'
    
    return record

def generate_student_record(student_id, risk_class):
    """
    Generate a student record with balanced features.
    risk_class: 0 = Low Risk, 1 = Moderate Risk, 2 = High Risk
    """
    # Base ranges for each risk class (higher = better performance)
    if risk_class == 0:  # Low Risk (good performance)
        base_range = (3, 4)
        variation = 0.5
    elif risk_class == 1:  # Moderate Risk
        base_range = (2, 3)
        variation = 0.8
    else:  # High Risk (poor performance)
        base_range = (1, 2)
        variation = 0.6
    
    record = {
        'student_id': student_id,
        'name': f'Student {student_id}',
        'course': random.choice(['BSCS', 'BSIT', 'BLIS', 'BSA']),
        'department': 'CCIS',
        'year': random.randint(1, 4),
        'email': f'student{student_id}@university.edu',
    }
    
    # Generate features with natural variation
    for feature in FEATURES:
        # Apply different base values for different feature groups to create complexity
        if feature in ['academic_consistency', 'subject_mastery_level', 'exam_performance_consistency']:
            # Academic features - correlate with risk class but with variation
            base = random.uniform(*base_range)
            value = min(4, max(1, round(base + random.uniform(-variation, variation), 1)))
        elif feature in ['study_habits_consistency', 'lms_engagement_level', 'assignment_completion_rate']:
            # Learning behavior - moderate correlation
            base = random.uniform(*base_range)
            value = min(4, max(1, round(base + random.uniform(-variation, variation), 1)))
        elif feature in ['class_participation', 'responsiveness_to_feedback', 'consultation_frequency']:
            # Instructor interaction - some correlation
            base = random.uniform(*base_range)
            value = min(4, max(1, round(base + random.uniform(-variation, variation), 1)))
        elif feature in ['group_study_participation', 'peer_collaboration_quality', 'academic_peer_environment_strength']:
            # Peer influence - moderate correlation
            base = random.uniform(*base_range)
            value = min(4, max(1, round(base + random.uniform(-variation, variation), 1)))
        elif feature in ['adaptation_to_course_difficulty', 'engagement_in_program_activities', 'skill_development_alignment']:
            # Course experience - some correlation
            base = random.uniform(*base_range)
            value = min(4, max(1, round(base + random.uniform(-variation, variation), 1)))
        elif feature in ['financial_stability', 'scholarship_support_level']:
            # Financial factors - reverse scoring already applied (4 = stable, 1 = difficult)
            # High risk students tend to have lower financial stability
            if risk_class == 2:  # High risk
                base = random.uniform(1, 2.5)
            elif risk_class == 1:  # Moderate risk
                base = random.uniform(2, 3.5)
            else:  # Low risk
                base = random.uniform(2.5, 4)
            value = min(4, max(1, round(base + random.uniform(-0.5, 0.5), 1)))
        elif feature == 'stress_level':
            # Stress level - REVERSE SCORING: high stress = 1, low stress = 4
            # High risk students tend to have higher stress (lower score after reversal)
            if risk_class == 2:  # High risk - high stress
                original_stress = random.uniform(3, 4)  # High stress
            elif risk_class == 1:  # Moderate risk
                original_stress = random.uniform(2, 3)
            else:  # Low risk - low stress
                original_stress = random.uniform(1, 2.5)
            # Reverse: 5 - original (so high stress becomes low score)
            value = min(4, max(1, round(5 - original_stress, 1)))
        elif feature in ['motivation_level', 'time_management_skills']:
            # Personal factors - correlate with risk class
            base = random.uniform(*base_range)
            value = min(4, max(1, round(base + random.uniform(-variation, variation), 1)))
        else:
            value = random.randint(1, 4)
        
        record[feature] = value
    
    # Add some random outliers to prevent perfect patterns
    if random.random() < 0.15:  # 15% chance of outlier
        outlier_feature = random.choice(FEATURES[:5])
        record[outlier_feature] = random.randint(1, 4)
    
    record['risk_label'] = risk_class
    
    # Add legacy fields for backward compatibility
    record['study_hours'] = random.randint(1, 10)
    record['library_visits'] = random.randint(0, 20)
    record['scholarship'] = random.choice(['yes', 'no'])
    record['scholarship_amount'] = random.randint(0, 50000) if record['scholarship'] == 'yes' else 0
    record['family_income'] = random.randint(10000, 100000)
    record['lms_login_per_month'] = random.randint(0, 30)
    record['status'] = 'active'
    
    return record

def calculate_risk_from_features(record):
    """
    Calculate risk label based on combined features (not single dominant variable).
    This ensures no single feature determines the target.
    """
    # Calculate weighted scores for different categories
    academic_score = (
        record['academic_consistency'] +
        record['gpa_trend'] +
        record['subject_mastery_level'] +
        record['exam_performance_consistency']
    ) / 4
    
    behavior_score = (
        record['study_habits_consistency'] +
        record['lms_engagement_level'] +
        record['assignment_completion_rate'] +
        record['self_learning_initiative']
    ) / 4
    
    financial_score = (
        record['financial_stability'] +
        record['scholarship_support_level']
    ) / 2
    
    personal_score = (
        record['motivation_level'] +
        record['stress_level'] +  # Already reversed
        record['time_management_skills']
    ) / 3
    
    # Combined score (weighted average)
    combined_score = (
        academic_score * 0.3 +
        behavior_score * 0.25 +
        financial_score * 0.2 +
        personal_score * 0.25
    )
    
    # Classify based on combined score
    if combined_score >= 3.2:
        return 0  # Low Risk
    elif combined_score >= 2.2:
        return 1  # Moderate Risk
    else:
        return 2  # High Risk

def generate_dataset(num_students=80):
    """
    Generate a balanced dataset with specified number of students.
    """
    students = []
    
    # Generate balanced distribution across risk classes
    students_per_class = num_students // 3
    
    for risk_class in [0, 1, 2]:
        for i in range(students_per_class):
            student_id = f"STU-{str(len(students) + 1).zfill(4)}"
            record = generate_student_record(student_id, risk_class)
            
            # Recalculate risk based on features to ensure no direct leakage
            # This adds complexity and prevents perfect patterns
            calculated_risk = calculate_risk_from_features(record)
            
            # 80% chance to use calculated risk, 20% to keep original (adds noise)
            if random.random() < 0.8:
                record['risk_label'] = calculated_risk
            
            students.append(record)
    
    # Add specific at-risk students (5 each for financial, personal, academic)
    at_risk_types = ['financial', 'personal', 'academic']
    for risk_type in at_risk_types:
        for i in range(5):
            student_id = f"ATR-{risk_type.upper()}-{i+1:02d}"
            record = generate_at_risk_student(student_id, risk_type)
            students.append(record)
    
    # Shuffle the dataset
    random.shuffle(students)
    
    return students

def save_to_csv(students, filename):
    """
    Save the dataset to CSV file.
    """
    # Define all fieldnames matching the new schema
    fieldnames = [
        'student_id', 'name', 'course', 'department', 'year', 'email',
        # A. Academic Performance
        'academic_consistency', 'gpa_trend', 'subject_mastery_level', 'exam_performance_consistency',
        # B. Learning Behavior
        'study_habits_consistency', 'lms_engagement_level', 'assignment_completion_rate', 'self_learning_initiative',
        # C. Instructor Interaction
        'class_participation', 'responsiveness_to_feedback', 'consultation_frequency',
        # D. Peer Influence
        'group_study_participation', 'peer_collaboration_quality', 'academic_peer_environment_strength',
        # E. Course Experience
        'adaptation_to_course_difficulty', 'engagement_in_program_activities', 'skill_development_alignment',
        # F. Financial Factors
        'financial_stability', 'scholarship_support_level',
        # G. Personal Factors
        'motivation_level', 'stress_level', 'time_management_skills',
        # Target
        'risk_label',
        # Legacy fields
        'study_hours', 'library_visits', 'scholarship', 'scholarship_amount', 
        'family_income', 'lms_login_per_month', 'status',
    ]
    
    with open(filename, 'w', newline='') as csvfile:
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(students)
    
    print(f"Dataset saved to {filename}")
    print(f"Total students: {len(students)}")
    
    # Print class distribution
    risk_counts = {}
    for student in students:
        risk = student['risk_label']
        risk_counts[risk] = risk_counts.get(risk, 0) + 1
    
    print("\nRisk Label Distribution:")
    for risk in sorted(risk_counts.keys()):
        label = {0: 'Low Risk', 1: 'Moderate Risk', 2: 'High Risk'}[risk]
        print(f"  {label}: {risk_counts[risk]} students")

if __name__ == '__main__':
    # Generate dataset with 80 students
    students = generate_dataset(num_students=80)
    
    # Save to CSV
    output_file = 'c:\\Users\\marvin\\Desktop\\te\\data\\student_performance_dataset_v2.csv'
    save_to_csv(students, output_file)
