import os
os.system('mysqldump -u root -p%s bifm > database.sql' % password)