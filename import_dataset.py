import csv
import psycopg2
from psycopg2.extras import execute_batch

# Database connection settings
# Update these with your actual database credentials
DB_CONFIG = {
    'host': 'localhost',
    'database': 'your_database_name',
    'user': 'your_username',
    'password': 'your_password',
    'port': '5432'
}

def import_csv_to_database(csv_file, db_config):
    """
    Import CSV data into the students table using the new schema.
    """
    # Read CSV file
    with open(csv_file, 'r', newline='') as csvfile:
        reader = csv.DictReader(csvfile)
        students = list(reader)
    
    print(f"Read {len(students)} students from CSV file")
    
    # Connect to database
    conn = psycopg2.connect(**db_config)
    cursor = conn.cursor()
    
    try:
        # Clear existing data (optional - remove if you want to keep existing data)
        cursor.execute("TRUNCATE TABLE students CASCADE;")
        print("Cleared existing students table")
        
        # Prepare insert statement
        insert_query = """
        INSERT INTO students (
            student_id, name, course, department, year, email,
            academic_consistency, gpa_trend, subject_mastery_level, exam_performance_consistency,
            study_habits_consistency, lms_engagement_level, assignment_completion_rate, self_learning_initiative,
            class_participation, responsiveness_to_feedback, consultation_frequency,
            group_study_participation, peer_collaboration_quality, academic_peer_environment_strength,
            adaptation_to_course_difficulty, engagement_in_program_activities, skill_development_alignment,
            financial_stability, scholarship_support_level,
            motivation_level, stress_level, time_management_skills,
            risk_label,
            study_hours, library_visits, scholarship, scholarship_amount, 
            family_income, lms_login_per_month, status
        ) VALUES (
            %(student_id)s, %(name)s, %(course)s, %(department)s, %(year)s, %(email)s,
            %(academic_consistency)s, %(gpa_trend)s, %(subject_mastery_level)s, %(exam_performance_consistency)s,
            %(study_habits_consistency)s, %(lms_engagement_level)s, %(assignment_completion_rate)s, %(self_learning_initiative)s,
            %(class_participation)s, %(responsiveness_to_feedback)s, %(consultation_frequency)s,
            %(group_study_participation)s, %(peer_collaboration_quality)s, %(academic_peer_environment_strength)s,
            %(adaptation_to_course_difficulty)s, %(engagement_in_program_activities)s, %(skill_development_alignment)s,
            %(financial_stability)s, %(scholarship_support_level)s,
            %(motivation_level)s, %(stress_level)s, %(time_management_skills)s,
            %(risk_label)s,
            %(study_hours)s, %(library_visits)s, %(scholarship)s, %(scholarship_amount)s, 
            %(family_income)s, %(lms_login_per_month)s, %(status)s
        )
        """
        
        # Prepare data for batch insert
        data_to_insert = []
        for student in students:
            # Convert string values to appropriate types
            row = {
                'student_id': student['student_id'],
                'name': student['name'],
                'course': student['course'],
                'department': student['department'],
                'year': int(student['year']),
                'email': student['email'],
                # Academic Performance
                'academic_consistency': float(student['academic_consistency']) if student['academic_consistency'] else None,
                'gpa_trend': float(student['gpa_trend']) if student['gpa_trend'] else None,
                'subject_mastery_level': float(student['subject_mastery_level']) if student['subject_mastery_level'] else None,
                'exam_performance_consistency': float(student['exam_performance_consistency']) if student['exam_performance_consistency'] else None,
                # Learning Behavior
                'study_habits_consistency': float(student['study_habits_consistency']) if student['study_habits_consistency'] else None,
                'lms_engagement_level': float(student['lms_engagement_level']) if student['lms_engagement_level'] else None,
                'assignment_completion_rate': float(student['assignment_completion_rate']) if student['assignment_completion_rate'] else None,
                'self_learning_initiative': float(student['self_learning_initiative']) if student['self_learning_initiative'] else None,
                # Instructor Interaction
                'class_participation': float(student['class_participation']) if student['class_participation'] else None,
                'responsiveness_to_feedback': float(student['responsiveness_to_feedback']) if student['responsiveness_to_feedback'] else None,
                'consultation_frequency': float(student['consultation_frequency']) if student['consultation_frequency'] else None,
                # Peer Influence
                'group_study_participation': float(student['group_study_participation']) if student['group_study_participation'] else None,
                'peer_collaboration_quality': float(student['peer_collaboration_quality']) if student['peer_collaboration_quality'] else None,
                'academic_peer_environment_strength': float(student['academic_peer_environment_strength']) if student['academic_peer_environment_strength'] else None,
                # Course Experience
                'adaptation_to_course_difficulty': float(student['adaptation_to_course_difficulty']) if student['adaptation_to_course_difficulty'] else None,
                'engagement_in_program_activities': float(student['engagement_in_program_activities']) if student['engagement_in_program_activities'] else None,
                'skill_development_alignment': float(student['skill_development_alignment']) if student['skill_development_alignment'] else None,
                # Financial Factors
                'financial_stability': float(student['financial_stability']) if student['financial_stability'] else None,
                'scholarship_support_level': float(student['scholarship_support_level']) if student['scholarship_support_level'] else None,
                # Personal Factors
                'motivation_level': float(student['motivation_level']) if student['motivation_level'] else None,
                'stress_level': float(student['stress_level']) if student['stress_level'] else None,
                'time_management_skills': float(student['time_management_skills']) if student['time_management_skills'] else None,
                # Target
                'risk_label': int(student['risk_label']),
                # Legacy fields
                'study_hours': float(student['study_hours']),
                'library_visits': int(student['library_visits']),
                'scholarship': student['scholarship'],
                'scholarship_amount': float(student['scholarship_amount']),
                'family_income': float(student['family_income']),
                'lms_login_per_month': int(student['lms_login_per_month']),
                'status': student['status'],
            }
            data_to_insert.append(row)
        
        # Execute batch insert
        execute_batch(cursor, insert_query, data_to_insert)
        
        # Commit transaction
        conn.commit()
        
        print(f"Successfully imported {len(data_to_insert)} students into database")
        
        # Verify import
        cursor.execute("SELECT COUNT(*) FROM students")
        count = cursor.fetchone()[0]
        print(f"Total students in database: {count}")
        
        # Show risk label distribution
        cursor.execute("SELECT risk_label, COUNT(*) FROM students GROUP BY risk_label ORDER BY risk_label")
        risk_distribution = cursor.fetchall()
        print("\nRisk Label Distribution:")
        for risk, count in risk_distribution:
            label = {0: 'Low Risk', 1: 'Moderate Risk', 2: 'High Risk'}[risk]
            print(f"  {label}: {count} students")
        
    except Exception as e:
        print(f"Error importing data: {e}")
        conn.rollback()
        raise
    finally:
        cursor.close()
        conn.close()

if __name__ == '__main__':
    # Update these paths and credentials
    csv_file = r'c:\Users\marvin\Desktop\te\data\student_performance_dataset.csv'
    
    print("Importing student dataset into database...")
    print("Make sure to update DB_CONFIG with your actual database credentials")
    print("And ensure the database schema has been updated to schema_new.sql")
    
    # Uncomment and update these credentials before running
    # import_csv_to_database(csv_file, DB_CONFIG)
    
    print("\nTo use this script:")
    print("1. Update DB_CONFIG with your database credentials")
    print("2. Run schema_new.sql to update the database schema")
    print("3. Uncomment the import_csv_to_database() call")
    print("4. Run this script: python import_dataset.py")
