import random

# Configuration
TOTAL_RECORDS = 5000  # 👈 changed from 1000 to 5000
OUTPUT_FILE = "generated_students_5000.txt"

COURSES = ["BSIT", "BSCS", "BSA", "BLIS"]
DEPARTMENTS = ["CCIS"]

def r_float(low, high):
    return round(random.uniform(low, high), 1)

def generate_student_data(index):
    dice = random.random()

    if dice < 0.10:
        student_id = f"ATR-ACADEMIC-{index:04d}"
        name = f"Student {student_id} (Academic Risk)"
        risk_label = 2

        academic_consistency = r_float(1.0, 1.5)
        gpa_trend = r_float(1.0, 1.5)
        subject_mastery_level = r_float(1.0, 1.8)
        exam_performance_consistency = r_float(1.0, 1.8)
        study_habits_consistency = r_float(1.0, 1.8)
        lms_engagement_level = r_float(1.0, 1.8)
        assignment_completion_rate = r_float(1.0, 1.8)
        self_learning_initiative = random.choice([1, 2])
        class_participation = r_float(1.0, 1.8)
        responsiveness_to_feedback = r_float(1.0, 1.8)
        consultation_frequency = r_float(1.0, 1.8)
        group_study_participation = r_float(1.0, 1.8)
        peer_collaboration_quality = r_float(1.0, 1.8)

        academic_peer_environment_strength = r_float(1.5, 2.8)
        adaptation_to_course_difficulty = r_float(1.0, 1.8)
        engagement_in_program_activities = r_float(1.0, 2.0)
        skill_development_alignment = r_float(1.0, 2.0)
        financial_stability = r_float(2.0, 4.0)
        scholarship_support_level = r_float(2.0, 4.0)
        motivation_level = r_float(1.0, 2.0)
        stress_level = r_float(3.0, 4.0)
        time_management_skills = r_float(1.0, 2.0)

        study_hours = random.randint(0, 3)
        library_visits = random.randint(0, 5)
        scholarship = "no"
        scholarship_amount = 0
        family_income = random.randint(30000, 100000)
        lms_login_per_month = random.randint(0, 10)

    elif dice < 0.18:
        student_id = f"ATR-FINANCIAL-{index:04d}"
        name = f"Student {student_id} (Financial Risk)"
        risk_label = 2

        academic_consistency = r_float(2.0, 3.0)
        gpa_trend = r_float(1.0, 2.0)
        subject_mastery_level = r_float(2.0, 3.0)
        exam_performance_consistency = r_float(2.0, 3.0)
        study_habits_consistency = r_float(2.0, 3.0)

        lms_engagement_level = r_float(1.5, 2.5)
        assignment_completion_rate = r_float(1.5, 2.5)
        self_learning_initiative = random.choice([1, 2])
        class_participation = r_float(1.5, 2.5)

        responsiveness_to_feedback = r_float(1.5, 2.5)
        consultation_frequency = r_float(1.0, 2.0)
        group_study_participation = r_float(1.0, 2.0)
        peer_collaboration_quality = r_float(1.0, 2.0)

        academic_peer_environment_strength = r_float(1.5, 2.5)
        adaptation_to_course_difficulty = r_float(1.5, 2.5)
        engagement_in_program_activities = r_float(1.0, 2.0)
        skill_development_alignment = r_float(1.5, 2.5)

        financial_stability = r_float(1.0, 1.5)
        scholarship_support_level = r_float(1.0, 2.0)
        motivation_level = r_float(1.5, 2.5)
        stress_level = r_float(3.5, 4.0)
        time_management_skills = r_float(1.5, 2.5)

        study_hours = random.randint(1, 4)
        library_visits = random.randint(0, 4)
        scholarship = random.choice(["yes", "no"])
        scholarship_amount = random.randint(1000, 5000) if scholarship == "yes" else 0
        family_income = random.randint(5000, 20000)
        lms_login_per_month = random.randint(0, 10)

    elif dice < 0.25:
        student_id = f"ATR-PERSONAL-{index:04d}"
        name = f"Student {student_id} (Personal Risk)"
        risk_label = 2

        academic_consistency = r_float(2.0, 3.0)
        gpa_trend = r_float(1.5, 2.5)
        subject_mastery_level = r_float(2.0, 3.0)

        exam_performance_consistency = r_float(2.0, 3.0)
        study_habits_consistency = r_float(1.0, 2.0)
        lms_engagement_level = r_float(1.0, 2.0)

        assignment_completion_rate = r_float(1.0, 2.0)
        self_learning_initiative = random.choice([1, 2])

        class_participation = r_float(1.0, 2.0)
        responsiveness_to_feedback = r_float(1.0, 2.0)
        consultation_frequency = r_float(1.0, 2.0)

        group_study_participation = r_float(1.0, 2.0)
        peer_collaboration_quality = r_float(1.0, 2.0)

        academic_peer_environment_strength = r_float(1.5, 2.5)
        adaptation_to_course_difficulty = r_float(1.5, 2.5)

        engagement_in_program_activities = r_float(1.0, 2.5)
        skill_development_alignment = r_float(1.5, 2.5)

        financial_stability = r_float(2.0, 3.5)
        scholarship_support_level = r_float(2.0, 3.5)

        motivation_level = r_float(1.0, 1.8)
        stress_level = r_float(3.8, 4.0)
        time_management_skills = r_float(1.0, 1.8)

        study_hours = random.randint(1, 5)
        library_visits = random.randint(0, 3)
        scholarship = random.choice(["yes", "no"])
        scholarship_amount = random.randint(5000, 35000) if scholarship == "yes" else 0
        family_income = random.randint(25000, 90000)
        lms_login_per_month = random.randint(2, 12)

    else:
        student_id = f"STU-{index:05d}"
        name = f"Student {student_id}"
        risk_label = random.choice([0, 1])

        academic_consistency = r_float(1.5, 4.0)
        gpa_trend = random.choice([1, 2, 3, 4])
        subject_mastery_level = r_float(1.5, 4.0)

        exam_performance_consistency = r_float(1.5, 4.0)
        study_habits_consistency = r_float(1.5, 4.0)
        lms_engagement_level = r_float(1.5, 4.0)

        assignment_completion_rate = r_float(1.5, 4.0)
        self_learning_initiative = random.choice([1, 2, 3, 4])

        class_participation = r_float(1.5, 4.0)
        responsiveness_to_feedback = r_float(1.5, 4.0)

        consultation_frequency = r_float(1.5, 4.0)
        group_study_participation = r_float(1.5, 4.0)

        peer_collaboration_quality = r_float(1.5, 4.0)
        academic_peer_environment_strength = r_float(1.5, 4.0)

        adaptation_to_course_difficulty = r_float(1.5, 4.0)
        engagement_in_program_activities = r_float(1.5, 4.0)

        skill_development_alignment = r_float(1.5, 4.0)
        financial_stability = r_float(1.5, 4.0)
        scholarship_support_level = r_float(1.5, 4.0)

        motivation_level = r_float(1.5, 4.0)
        stress_level = r_float(1.0, 3.5)
        time_management_skills = r_float(1.5, 4.0)

        study_hours = random.randint(2, 10)
        library_visits = random.randint(0, 20)
        scholarship = random.choice(["yes", "no"])
        scholarship_amount = random.randint(3000, 45000) if scholarship == "yes" else 0
        family_income = random.randint(12000, 100000)
        lms_login_per_month = random.randint(0, 30)

    course = random.choice(COURSES)
    department = random.choice(DEPARTMENTS)
    year = random.choice([1, 2, 3, 4])
    email = f"{student_id}@university.edu"
    status = "active"

    return f"""
{student_id}
{name}
{course}
{department}
{year}
{email}
{academic_consistency}
{gpa_trend}
{subject_mastery_level}
{exam_performance_consistency}
{study_habits_consistency}
{lms_engagement_level}
{assignment_completion_rate}
{self_learning_initiative}
{class_participation}
{responsiveness_to_feedback}
{consultation_frequency}
{group_study_participation}
{peer_collaboration_quality}
{academic_peer_environment_strength}
{adaptation_to_course_difficulty}
{engagement_in_program_activities}
{skill_development_alignment}
{financial_stability}
{scholarship_support_level}
{motivation_level}
{stress_level}
{time_management_skills}
{risk_label}
{study_hours}
{library_visits}
{scholarship}
{scholarship_amount}
{family_income}
{lms_login_per_month}
{status}
"""

# Generate file
with open(OUTPUT_FILE, "w") as f:
    f.write("student_id\nname\ncourse\ndepartment\nyear\nemail\n...")  # keep your header or reuse yours

    for i in range(1, TOTAL_RECORDS + 1):
        f.write(generate_student_data(i))

print(f"Generated {TOTAL_RECORDS} records -> {OUTPUT_FILE}")