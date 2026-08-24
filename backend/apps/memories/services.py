from .models import Place


def delete_place_if_empty(place_id: int | None) -> None:
    if not place_id:
        return

    place = Place.objects.filter(pk=place_id).first()
    if place and not place.memories.exists():
        place.delete()
