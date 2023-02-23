import mysql.connector
import json
import os
from os import path
from urllib.parse import urlparse
import requests
import codecs

snake_in_polish_in_ascii="TÃºi, mÃ ng bá»c thá»±c pháº©m"

print(codecs.decode(b'TÃºi, mÃ ng bá»c thá»±c pháº©m', 'utf-8'))