from bs4 import BeautifulSoup
import re
import requests


def parse_courses(course):
    course = re.sub(r'\..+', '', course)
    if re.match(r'^.+\d', course) is None or re.match(r'^[nN]ot', course) is not None:
        return []
    else:
        result = []
        departments = re.finditer(r'(?P<dept>([A-Z][&/\s]?){2,}(?=[\s\d]))', course)
        nums = re.finditer(r'(?<!\d)\d{3}(?!\d)', course)
        associations = sorted([dept for dept in departments] + [num for num in nums], key=lambda match: match.start())
        current_dept = None
        for association in associations:
            try:
                current_dept = association.group('dept').replace(' ', '')
            except IndexError:
                result.append(current_dept + " " + association.group())
        return result


# connect to website
URL = 'https://guide.wisc.edu/courses/comp_sci/'
page = requests.get(URL)

# scrape website for courses and prerequisite classes
soup = BeautifulSoup(page.content, 'html.parser')
course_divs = soup.find_all('div', class_='courseblock')

course_map = {}
for div in course_divs:
    prereq_list = []
    course_name = div.find('span', class_='courseblockcode').text
    prereq = div.find('span', class_='cbextra-data').text.replace(u'\xa0', u' ').replace('\u200b', '')
    course_map[course_name] = parse_courses(prereq)

# associate courses and prereqs in dictionary (course -> prereq)
for key in course_map:
    print(key, '->', course_map[key])

# display courses
