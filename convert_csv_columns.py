import pandas as pd

# Read the CSV file
input_file = 'student_performance_dataset.csv'  # Update with your actual file name
output_file = 'student_performance_dataset_cleaned.csv'

# Column mapping from CSV headers to database column names
column_mapping = {
    'name': 'full_name',
    'course': 'course',
    'year_level': 'year_level',
    'study_hours': 'study_hours',
    'library_visits': 'library_visits',
    'scholarship': 'scholarship',
    'scholarship_amount': 'scholarship_amount',
    'family_income': 'family_income',
    'gpa_y1s1': 'gpa_y1s1',
    'gpa_y1s2': 'gpa_y1s2',
    'gpa_y2s1': 'gpa_y2s1',
    'gpa_y2s2': 'gpa_y2s2',
    'gpa_y3s1': 'gpa_y3s1',
    'lms_login_per_month': 'lms_login_per_month',
    'status': 'status',
    'Course or Program Experience I like the course/program I chose.': 'like_course',
    'I am interested in the subjects in my course.': 'interested_in_subjects',
    'My course motivates me to study harder.': 'course_motivates',
    'Academic Performance/History I am satisfied with my academic performance.': 'satisfied_with_performance',
    'My previous grades affect my current studies.': 'previous_grades_affect',
    'I always try to improve my grades.': 'try_improve_grades',
    'Learning Behavior I study regularly for my lessons.': 'study_regularly',
    'I submit my school requirements on time.': 'submit_on_time',
    'I manage my study time well.': 'manage_time_well',
    'Instructor Interaction My instructors explain lessons clearly.': 'instructors_explain_clearly',
    'I can easily approach my instructors when I have questions.': 'approach_instructors',
    'My instructors encourage students to learn.': 'instructors_encourage',
    'Classmate/Peer Influence My classmates influence me positively in school.': 'classmates_influence_positively',
    'I work well with my classmates during activities.': 'work_well_with_classmates',
    'My friends motivate me to do better in my studies.': 'friends_motivate',
    'concerns': 'concerns'
}

# Read CSV
df = pd.read_csv(input_file)

# Rename columns
df = df.rename(columns=column_mapping)

# Add student_id if not present (generate from index or name)
if 'student_id' not in df.columns:
    df['student_id'] = df.index.astype(str).str.zfill(6)

# Add department column if not present (can be derived from course)
if 'department' not in df.columns:
    # Simple mapping - you may need to adjust this based on your actual course-department mapping
    df['department'] = df['course']

# Add email column if not present
if 'email' not in df.columns:
    df['email'] = ''

# Save to new CSV
df.to_csv(output_file, index=False)

print(f"Converted CSV saved to {output_file}")
print(f"Columns: {list(df.columns)}")
