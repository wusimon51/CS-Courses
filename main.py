from bs4 import BeautifulSoup
import re
import requests


def parse_course_name(course):
    course = re.sub(r'\..+', '', course)
    if re.match(r'^.+\d', course) is None or re.match(r'^[nN]ot', course) is not None:
        return []
    else:
        course = course.replace('COMP SCI', 'COMPSCI').replace('I SY E', 'ISYE')
        matches = re.match(r'(([A-Z]{3,})/?)+', course)
        result = []
        return [course, matches]


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
    course_map[course_name] = parse_course_name(prereq)

# associate courses and prereqs in dictionary (course -> prereq)
for key in course_map:
    print(key, '->', course_map[key])

# display courses
