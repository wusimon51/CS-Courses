import json
import re
import requests
from bs4 import BeautifulSoup


def parse_courses(course_string, prereq_string):
    global nodes, links
    nodes[course_string] = None
    prereq_string = re.sub(r'\..+', '', prereq_string)
    if re.match(r'^.+\d', prereq_string) is None or re.match(r'^[nN]ot', prereq_string) is not None:
        return []
    else:
        # list of department names
        departments = re.finditer(r'(?P<dept>([A-Z][&/\s]?){2,}(?=[\s\d]))', prereq_string)
        # list of course numbers
        nums = re.finditer(r'(?<!\d)\d{3}(?!\d)', prereq_string)
        # combine both lists, sort by position found in string to preserve order
        associations = sorted([dept for dept in departments] + [num for num in nums], key=lambda match: match.start())
        current_dept = None
        for association in associations:
            try:
                # if item is a department name
                current_dept = '/'.join(sorted(association.group('dept').replace(' ', '').split('/')))
            except IndexError:
                # if item is a course number
                course = current_dept + ' ' + association.group()
                nodes[course] = None
                links.append({'source': course, 'target': course_string})


# connect to website
URL = 'https://guide.wisc.edu/courses/comp_sci/'
page = requests.get(URL)

# scrape website for courses and prerequisite classes
soup = BeautifulSoup(page.content, 'html.parser')
course_divs = soup.find_all('div', class_='courseblock')

# associate courses and prereqs in dictionary (course -> prereq)
nodes = {}
links = []
for div in course_divs:
    # string for course in question
    course_name = div.find('span', class_='courseblockcode').text.replace(u'\xa0', '').replace('\u200b', '')
    # string containing course's prerequisites
    prereqs = div.find('span', class_='cbextra-data').text.replace(u'\xa0', ' ').replace('\u200b', '')

    # normalize course's name
    course_name = re.sub(r'(?<=[\sa-zA-Z])\d', lambda match: ' ' + match.group(), course_name)
    course_name = '/'.join(sorted(course_name.split(' ')[0].split('/'))) + ' ' + course_name.split(' ')[1]
    parse_courses(course_name, prereqs)

# write courses to json file
with open('data.json', 'w') as outfile:
    json.dump({'nodes': [{'id': node} for node in nodes], 'links': links}, outfile)
