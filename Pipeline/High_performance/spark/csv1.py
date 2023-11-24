import csv

with open('profiles1.csv', 'w', newline='') as file:
    writer = csv.writer(file)
    field = ["business_name", "contractor_id", "company_name", "organizational_division", "country", "status", "created_at", "updated_at", "created_by", "updated_by", "layer_3", "layer_4", "layer_5", "layer_6"]
    
    writer.writerow(field)
    for x in range(2000000):
        writer.writerow(["CP1", "1", "VN1", "1", "CN1", "TRUE", "9/5/2022  8:48:00 AM", "11/1/2022  2:57:00 AM", "9", "9", "NULL", "NULL", "NULL", "NULL"])