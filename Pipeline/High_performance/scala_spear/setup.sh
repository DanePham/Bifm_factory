#! /bin/bash

set -e
echo "[$(date)]        INFO:[+]Spear-framework setup status     [started]"
{
  #Starting containers for postgres,mongo,kafka,spark and hadoop
  docker-compose up -d && sleep 60 &&
    #starting hadoop and hive services
    docker exec -it spear bash -c "hdfs namenode -format && start-dfs.sh && hdfs dfs -mkdir -p /tmp && hdfs dfs -mkdir -p /user/hive/warehouse && hdfs dfs -chmod g+w /user/hive/warehouse" &&
    docker exec -it spear bash -c "sed '90 a figlet -f slant -w 100 Spear Framework' /usr/bin/spark-2.4.7-bin-without-hadoop/bin/spark-shell > /usr/bin/spark-2.4.7-bin-without-hadoop/bin/spark-shell-test && yum install -y epel-release && yum install -y figlet && yes | cp /usr/bin/spark-2.4.7-bin-without-hadoop/bin/spark-shell-test /usr/bin/spark-2.4.7-bin-without-hadoop/bin/spark-shell" &&
    docker exec -d spear bash -c "hive --service metastore && sleep 15 && hive --service hiveserver2 && sleep 20 " &&
    docker exec -it spear bash -c "chmod u+x /root/spear-shell.sh && wget https://mirrors.estointernet.in/apache/kafka/2.7.0/kafka_2.13-2.7.0.tgz -O /tmp/kafka.tgz && cd / && tar -xvf /tmp/kafka.tgz -C / && mv kafka_2.13-2.7.0 kafka && rm -f /etc/yum.repos.d/bintray-rpm.repo &&  curl -L https://www.scala-sbt.org/sbt-rpm.repo > sbt-rpm.repo && mv sbt-rpm.repo /etc/yum.repos.d/ && yum install -y sbt && cd /opt && git clone https://github.com/romans-weapon/spear-framework.git && cd spear-framework && sbt 'set test in assembly := {}' clean assembly && cp /etc/jars/* /opt/spear-framework/target/scala-*/" &&
    echo "[$(date)]        INFO:[+]Spear-framework setup status     [success]"
} && {
  echo "====================================================================================="
  echo "Further steps to start spear on docker:"
  echo "    1.ssh into the spear-container using the command   : docker exec -it spear bash "
  echo "    2.Start spear-framework on spark using the command : spear-shell"
} ||
  {
    echo "[$(date)]        INFO:[+]Spear-framework setup status      [failed]"
    exit 1
  }
