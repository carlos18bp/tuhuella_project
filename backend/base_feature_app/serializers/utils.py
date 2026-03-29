def get_lang(serializer):
    """Return 'es' or 'en' from serializer context (default 'es')."""
    request = serializer.context.get('request')
    if request:
        lang = request.query_params.get('lang', 'es')
        return lang if lang in ('es', 'en') else 'es'
    return serializer.context.get('lang', 'es')
