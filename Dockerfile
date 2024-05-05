FROM python:3.9.19
RUN apt-get update -y
RUN apt-get upgrade -y
RUN pip install --upgrade pip 
RUN pip install psycopg2
RUN pip install psycopg2-binary
RUN pip install pymongo
RUN pip install simplejson
RUN pip install sql2nosql
RUN pip install tqdm
COPY <<EOF /migrate.py
from sql2nosql import Migrator
Migrator(
    sql_config={
        "host": "postgres",
        "port": 5432,
        "username": "postgres",
        "password": "postgres",
        "database": "postgres"
    },
    nosql_config={
        "host": "mongo",
        "port": 27017,
        "username": "mongo",
        "password": "mongo"
    },
    sql_client="psycopg2",
    nosql_client="pymongo"
).migrate_data(tables=['"Album"', '"Artist"', '"Track"'])
EOF
ENTRYPOINT ["python", "/migrate.py"]
