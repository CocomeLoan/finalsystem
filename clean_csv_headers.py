import pandas as pd
import numpy as np

# Read the CSV file
input_file = r'c:\Users\marvin\Desktop\molo\data\smccsample_students_data.csv'
output_file = r'c:\Users\marvin\Desktop\New folder (3)\smccsample_students_data_cleaned.csv'

# Try different encodings
encodings = ['utf-8', 'latin-1', 'cp1252', 'iso-8859-1']

for encoding in encodings:
    try:
        # Read CSV
        df = pd.read_csv(input_file, encoding=encoding)
        print(f"Successfully read with encoding: {encoding}")
        break
    except UnicodeDecodeError:
        print(f"Failed with encoding: {encoding}")
        continue
else:
    print("Could not read file with any encoding")
    exit(1)

# Remove newlines from column names
df.columns = df.columns.str.replace('\n', ' ', regex=False)

# Column mapping from CSV headers to database column names
column_mapping = {
    'name': 'full_name',
    'Course or Program Experience  I like the course/program I chose.': 'like_course',
    'I am interested in the subjects in my course.': 'interested_in_subjects',
    'My course motivates me to study harder.': 'course_motivates',
    'Academic Performance/History  I am satisfied with my academic performance.': 'satisfied_with_performance',
    'My previous grades affect my current studies.': 'previous_grades_affect',
    'I always try to improve my grades.': 'try_improve_grades',
    'Learning Behavior  I study regularly for my lessons.': 'study_regularly',
    'I submit my school requirements on time.': 'submit_on_time',
    'I manage my study time well.': 'manage_time_well',
    'Instructor Interaction  My instructors explain lessons clearly.': 'instructors_explain_clearly',
    'I can easily approach my instructors when I have questions.': 'approach_instructors',
    'My instructors encourage students to learn.': 'instructors_encourage',
    'Classmate/Peer Influence  My classmates influence me positively in school.': 'classmates_influence_positively',
    'I work well with my classmates during activities.': 'work_well_with_classmates',
    'My friends motivate me to do better in my studies.': 'friends_motivate',
}

# Rename columns
df = df.rename(columns=column_mapping)

# Handle GPA columns FIRST - leave empty as empty string (will be NULL in database)
gpa_columns = ['gpa_y1s1', 'gpa_y1s2', 'gpa_y2s1', 'gpa_y2s2', 'gpa_y3s1']

for col in gpa_columns:
    if col in df.columns:
        # Convert to string first to handle any type
        df[col] = df[col].astype(str)
        # Strip whitespace
        df[col] = df[col].str.strip()
        # Replace empty strings with NaN
        df[col] = df[col].replace('', np.nan)
        df[col] = df[col].replace('nan', np.nan)
        # Convert to numeric, but keep NaN as NaN
        df[col] = pd.to_numeric(df[col], errors='coerce')
        # Replace NaN with empty string for CSV export
        df[col] = df[col].fillna('')

# Strip whitespace from all other string columns
for col in df.columns:
    if col not in gpa_columns and df[col].dtype == 'object':
        df[col] = df[col].str.strip()

# Replace empty strings and whitespace-only strings with 0 for other numeric columns
numeric_columns = ['year_level', 'study_hours', 'library_visits', 'scholarship_amount', 
                   'family_income', 'lms_login_per_month', 'like_course', 'interested_in_subjects', 'course_motivates',
                   'satisfied_with_performance', 'previous_grades_affect', 'try_improve_grades',
                   'study_regularly', 'submit_on_time', 'manage_time_well',
                   'instructors_explain_clearly', 'approach_instructors', 'instructors_encourage',
                   'classmates_influence_positively', 'work_well_with_classmates', 'friends_motivate']

for col in numeric_columns:
    if col in df.columns:
        # Replace empty strings and whitespace with NaN
        df[col] = df[col].replace('', np.nan)
        df[col] = df[col].replace(r'^\s*$', np.nan, regex=True)
        # Fill NaN with 0
        df[col] = df[col].fillna(0)
        # Convert to numeric to ensure proper type
        df[col] = pd.to_numeric(df[col], errors='coerce').fillna(0)

# Save to new CSV - don't use na_rep, let pandas handle NaN as empty strings
df.to_csv(output_file, index=False, encoding='utf-8')

print(f"Cleaned CSV saved to {output_file}")
print(f"Columns: {list(df.columns)}")
