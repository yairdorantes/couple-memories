from django.db import migrations, models
import django.core.validators
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ("couples", "0001_initial"),
    ]

    operations = [
        migrations.CreateModel(
            name="IntimacyRecord",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("title", models.TextField(validators=[django.core.validators.MaxLengthValidator(160)])),
                ("happened_at", models.DateTimeField()),
                ("place", models.TextField(blank=True)),
                (
                    "mood",
                    models.TextField(
                        choices=[
                            ("tender", "Tender"),
                            ("passionate", "Passionate"),
                            ("quiet", "Quiet"),
                            ("special", "Special"),
                        ],
                        default="tender",
                    ),
                ),
                ("note", models.TextField(blank=True, validators=[django.core.validators.MaxLengthValidator(300)])),
                ("is_favorite", models.BooleanField(default=False)),
                ("created_by_role", models.TextField(blank=True)),
                ("updated_by_role", models.TextField(blank=True)),
                (
                    "couple",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="intimacy_records",
                        to="couples.couple",
                    ),
                ),
            ],
            options={
                "db_table": "intimacy_records",
                "ordering": ["-happened_at", "-created_at"],
            },
        ),
        migrations.AddIndex(
            model_name="intimacyrecord",
            index=models.Index(fields=["couple", "-happened_at"], name="intimacy_re_couple__902c68_idx"),
        ),
        migrations.AddIndex(
            model_name="intimacyrecord",
            index=models.Index(fields=["couple", "mood"], name="intimacy_re_couple__3eadf7_idx"),
        ),
        migrations.AddIndex(
            model_name="intimacyrecord",
            index=models.Index(fields=["couple", "is_favorite"], name="intimacy_re_couple__4bc648_idx"),
        ),
        migrations.AddIndex(
            model_name="intimacyrecord",
            index=models.Index(fields=["couple", "created_by_role"], name="intimacy_re_couple__0435e0_idx"),
        ),
    ]

