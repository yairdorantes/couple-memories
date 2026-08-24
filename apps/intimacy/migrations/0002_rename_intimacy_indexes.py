from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("intimacy", "0001_initial"),
    ]

    operations = [
        migrations.RenameIndex(
            model_name="intimacyrecord",
            new_name="intimacy_re_couple__cb7650_idx",
            old_name="intimacy_re_couple__902c68_idx",
        ),
        migrations.RenameIndex(
            model_name="intimacyrecord",
            new_name="intimacy_re_couple__4b41d8_idx",
            old_name="intimacy_re_couple__3eadf7_idx",
        ),
        migrations.RenameIndex(
            model_name="intimacyrecord",
            new_name="intimacy_re_couple__f85ede_idx",
            old_name="intimacy_re_couple__4bc648_idx",
        ),
        migrations.RenameIndex(
            model_name="intimacyrecord",
            new_name="intimacy_re_couple__bb8b82_idx",
            old_name="intimacy_re_couple__0435e0_idx",
        ),
    ]
