SELECT menu_selection, menu_total_per_person, menu_total_booking FROM booking_requests WHERE booking_type = 'rinfresco_laurea' ORDER BY created_at DESC LIMIT 1;
