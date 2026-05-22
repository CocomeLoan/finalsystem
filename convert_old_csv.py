import csv
import random

# Set random seed for reproducibility
random.seed(42)

def convert_gpa_to_features(gpa_values):
    """
    Convert GPA values to 1-4 scale features.
    GPA scale is 1.0-5.0, we need to map to 1-4 scale.
    """
    features = {}
    
    # Extract GPA values
    gpa_y1s1 = gpa_values.get('gpa_y1s1', 0)
    gpa_y1s2 = gpa_values.get('gpa_y1s2', 0)
    gpa_y2s1 = gpa_values.get('gpa_y2s1', 0)
    gpa_y2s2 = gpa_values.get('gpa_y2s2', 0)
    gpa_y3s1 = gpa_values.get('gpa_y3s1', 0)
    
    # Calculate average GPA (excluding 5 which means not taken)
    valid_gpas = [g for g in [gpa_y1s1, gpa_y1s2, gpa_y2s1, gpa_y2s2, gpa_y3s1] if g and g != 5]
    avg_gpa = sum(valid_gpas) / len(valid_gpas) if valid_gpas else 2.5
    
    # Map GPA to 1-4 scale (1.0-5.0 -> 1-4)
    def gpa_to_scale(gpa):
        if not gpa or gpa == 5:
            return 2.0  # middle value for missing
        # Linear mapping: 1.0->1, 2.5->2.5, 5.0->4
        return round((gpa - 1.0) * (3.0 / 4.0) + 1.0, 1)
    
    # A. Academic Performance
    features['academic_consistency'] = gpa_to_scale(avg_gpa)
    
    # GPA trend: compare early vs late
    early_avg = sum([g for g in [gpa_y1s1, gpa_y1s2] if g and g != 5]) / len([g for g in [gpa_y1s1, gpa_y1s2] if g and g != 5]) if [g for g in [gpa_y1s1, gpa_y1s2] if g and g != 5] else 2.5
    late_avg = sum([g for g in [gpa_y2s1, gpa_y2s2, gpa_y3s1] if g and g != 5]) / len([g for g in [gpa_y2s1, gpa_y2s2, gpa_y3s1] if g and g != 5]) if [g for g in [gpa_y2s1, gpa_y2s2, gpa_y3s1] if g and g != 5] else 2.5
    
    if late_avg > early_avg + 0.2:
        features['gpa_trend'] = 4.0  # improving
    elif late_avg < early_avg - 0.2:
        features['gpa_trend'] = 1.0  # declining
    else:
        features['gpa_trend'] = 2.5  # stable
    
    features['subject_mastery_level'] = gpa_to_scale(avg_gpa)
    features['exam_performance_consistency'] = gpa_to_scale(avg_gpa)
    
    # B. Learning Behavior (derive from study_hours and lms_login)
    study_hours = gpa_values.get('study_hours', 2)
    lms_login = gpa_values.get('lms_login_per_month', 4)
    
    features['study_habits_consistency'] = min(4.0, max(1.0, round(study_hours * 0.8, 1)))
    features['lms_engagement_level'] = min(4.0, max(1.0, round(lms_login * 0.6, 1)))
    features['assignment_completion_rate'] = min(4.0, max(1.0, round(avg_gpa * 0.8, 1)))
    features['self_learning_initiative'] = min(4.0, max(1.0, round(lms_login * 0.5, 1)))
    
    # C. Instructor Interaction (random but correlated with performance)
    base = gpa_to_scale(avg_gpa)
    features['class_participation'] = min(4.0, max(1.0, round(base + random.uniform(-0.5, 0.5), 1)))
    features['responsiveness_to_feedback'] = min(4.0, max(1.0, round(base + random.uniform(-0.5, 0.5), 1)))
    features['consultation_frequency'] = min(4.0, max(1.0, round(random.uniform(1, 4), 1)))
    
    # D. Peer Influence (random)
    features['group_study_participation'] = round(random.uniform(1, 4), 1)
    features['peer_collaboration_quality'] = round(random.uniform(1, 4), 1)
    features['academic_peer_environment_strength'] = round(random.uniform(1, 4), 1)
    
    # E. Course Experience (correlated with GPA)
    features['adaptation_to_course_difficulty'] = min(4.0, max(1.0, round(base + random.uniform(-0.5, 0.5), 1)))
    features['engagement_in_program_activities'] = round(random.uniform(1, 4), 1)
    features['skill_development_alignment'] = min(4.0, max(1.0, round(base + random.uniform(-0.5, 0.5), 1)))
    
    # F. Financial Factors (from scholarship and family_income)
    scholarship = gpa_values.get('scholarship', 'no')
    family_income = gpa_values.get('family_income', 20000)
    
    if scholarship == 'yes':
        features['financial_stability'] = round(random.uniform(2.5, 4), 1)
        features['scholarship_support_level'] = round(random.uniform(2.5, 4), 1)
    else:
        features['financial_stability'] = round(random.uniform(1, 3), 1)
        features['scholarship_support_level'] = 1.0
    
    # G. Personal Factors
    features['motivation_level'] = min(4.0, max(1.0, round(base + random.uniform(-0.5, 0.5), 1)))
    
    # Stress level: reverse scoring (high stress = 1, low stress = 4)
    # Students with lower GPA tend to have higher stress
    if avg_gpa < 2.0:
        stress = random.uniform(3, 4)  # high stress
    elif avg_gpa > 3.0:
        stress = random.uniform(1, 2)  # low stress
    else:
        stress = random.uniform(2, 3)
    features['stress_level'] = round(5 - stress, 1)  # reverse
    
    features['time_management_skills'] = min(4.0, max(1.0, round(base + random.uniform(-0.5, 0.5), 1)))
    
    # Calculate risk label based on combined features
    academic_score = (features['academic_consistency'] + features['gpa_trend'] + 
                     features['subject_mastery_level'] + features['exam_performance_consistency']) / 4
    behavior_score = (features['study_habits_consistency'] + features['lms_engagement_level'] + 
                     features['assignment_completion_rate'] + features['self_learning_initiative']) / 4
    financial_score = (features['financial_stability'] + features['scholarship_support_level']) / 2
    personal_score = (features['motivation_level'] + features['stress_level'] + 
                     features['time_management_skills']) / 3
    
    combined_score = (academic_score * 0.3 + behavior_score * 0.25 + 
                     financial_score * 0.2 + personal_score * 0.25)
    
    if combined_score >= 3.2:
        risk_label = 0  # Low Risk
    elif combined_score >= 2.2:
        risk_label = 1  # Moderate Risk
    else:
        risk_label = 2  # High Risk
    
    features['risk_label'] = risk_label
    
    return features

def convert_csv(input_file, output_file):
    """Convert old CSV format to new format with 22 features"""
    
    with open(input_file, 'r', newline='') as infile:
        reader = csv.DictReader(infile)
        old_data = list(reader)
    
    new_data = []
    
    for row in old_data:
        # Extract GPA values
        gpa_values = {
            'gpa_y1s1': float(row.get('gpa_y1s1', 0)) if row.get('gpa_y1s1') and row.get('gpa_y1s1') != '5' else 0,
            'gpa_y1s2': float(row.get('gpa_y1s2', 0)) if row.get('gpa_y1s2') and row.get('gpa_y1s2') != '5' else 0,
            'gpa_y2s1': float(row.get('gpa_y2s1', 0)) if row.get('gpa_y2s1') and row.get('gpa_y2s1') != '5' else 0,
            'gpa_y2s2': float(row.get('gpa_y2s2', 0)) if row.get('gpa_y2s2') and row.get('gpa_y2s2') != '5' else 0,
            'gpa_y3s1': float(row.get('gpa_y3s1', 0)) if row.get('gpa_y3s1') and row.get('gpa_y3s1') != '5' else 0,
            'study_hours': int(row.get('study_hours', 2)),
            'lms_login_per_month': int(row.get('lms_login_per_month', 4)),
            'scholarship': row.get('scholarship', 'no'),
            'family_income': int(row.get('family_income', 20000)),
        }
        
        # Skip students without Y3S1 data (future semester)
        if gpa_values['gpa_y3s1'] == 0:
            continue
        
        # Convert to new features
        features = convert_gpa_to_features(gpa_values)
        
        # Create new record
        new_record = {
            'student_id': row.get('student_id', ''),
            'name': row.get('full_name', ''),
            'course': row.get('course', ''),
            'department': row.get('Department', ''),
            'year': int(row.get('year_level', 3)),
            'email': f"{row.get('student_id', '').lower()}@university.edu",
        }
        
        # Add all features
        new_record.update(features)
        
        # Add legacy fields
        new_record['study_hours'] = gpa_values['study_hours']
        new_record['library_visits'] = int(row.get('library_visits', 0))
        new_record['scholarship'] = gpa_values['scholarship']
        new_record['scholarship_amount'] = int(row.get('scholarship_amount', 0))
        new_record['family_income'] = gpa_values['family_income']
        new_record['lms_login_per_month'] = gpa_values['lms_login_per_month']
        new_record['status'] = row.get('status', 'active')
        
        new_data.append(new_record)
    
    # Define fieldnames
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
    
    with open(output_file, 'w', newline='') as outfile:
        writer = csv.DictWriter(outfile, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(new_data)
    
    print(f"Converted {len(new_data)} students from {input_file} to {output_file}")
    
    # Print class distribution
    risk_counts = {}
    for student in new_data:
        risk = student['risk_label']
        risk_counts[risk] = risk_counts.get(risk, 0) + 1
    
    print("\nRisk Label Distribution:")
    for risk in sorted(risk_counts.keys()):
        label = {0: 'Low Risk', 1: 'Moderate Risk', 2: 'High Risk'}[risk]
        print(f"  {label}: {risk_counts[risk]} students")

if __name__ == '__main__':
    input_file = r'c:\Users\marvin\Downloads\smcc_sample_students_datass.csv'
    output_file = r'c:\Users\marvin\Downloads\smcc_sample_students_datass_updated.csv'
    convert_csv(input_file, output_file)
