import json
import re

import requests
from bs4 import BeautifulSoup
from flask import Flask, render_template, url_for


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
                result.append(current_dept + ' ' + association.group())
        return result


# connect to website
URL = 'https://guide.wisc.edu/courses/comp_sci/'
page = requests.get(URL)

# scrape website for courses and prerequisite classes
soup = BeautifulSoup(page.content, 'html.parser')
course_divs = soup.find_all('div', class_='courseblock')

# associate courses and prereqs in dictionary (course -> prereq)
course_map = {}
for div in course_divs:
    prereq_list = []
    course_name = div.find('span', class_='courseblockcode').text.replace(u'\xa0', '').replace('\u200b', '')
    prereq = div.find('span', class_='cbextra-data').text.replace(u'\xa0', ' ').replace('\u200b', '')
    course_map[re.sub(r'(?<=[\sa-zA-Z])\d', lambda match: ' ' + match.group(), course_name)] = parse_courses(prereq)

# display courses
app = Flask(__name__)


@app.route('/')
def display():
    return render_template('index.html')


@app.route('/data')
def send_data():
    global course_map
    return json.dumps(course_map)


if __name__ == '__main__':
    app.run(debug=True)
