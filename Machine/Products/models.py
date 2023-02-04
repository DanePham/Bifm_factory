from django.db import models

class Product(models.Model):
    title = models.CharField(max_length=255)
    prict = models.CharField(max_length=255)
    urlImg = models.CharField(max_length=255)

    def __str__(self):
        return f"{self.title} ({self.release})"