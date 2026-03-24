import pytest
from django.urls import reverse

from base_feature_app.models import BlogPost


# ---------------------------------------------------------------------------
# Public endpoints
# ---------------------------------------------------------------------------

@pytest.mark.django_db
def test_list_blog_posts_returns_published_only(api_client, blog_post, draft_blog_post):
    """Public listing only returns published posts."""
    url = reverse('list-blog-posts')
    response = api_client.get(url)

    assert response.status_code == 200
    slugs = [p['slug'] for p in response.data['results']]
    assert blog_post.slug in slugs
    assert draft_blog_post.slug not in slugs


@pytest.mark.django_db
def test_list_blog_posts_pagination(api_client, blog_post):
    """Response includes pagination metadata."""
    url = reverse('list-blog-posts')
    response = api_client.get(url)

    assert response.status_code == 200
    assert 'count' in response.data
    assert 'page' in response.data
    assert 'total_pages' in response.data
    assert response.data['count'] >= 1


@pytest.mark.django_db
def test_retrieve_blog_post_by_slug(api_client, blog_post):
    """Public detail returns a published post by slug."""
    url = reverse('retrieve-blog-post', kwargs={'slug': blog_post.slug})
    response = api_client.get(url)

    assert response.status_code == 200
    assert response.data['slug'] == blog_post.slug
    assert response.data['title'] == blog_post.title_es


@pytest.mark.django_db
def test_retrieve_unpublished_post_returns_404(api_client, draft_blog_post):
    """Public detail returns 404 for unpublished posts."""
    url = reverse('retrieve-blog-post', kwargs={'slug': draft_blog_post.slug})
    response = api_client.get(url)

    assert response.status_code == 404


# ---------------------------------------------------------------------------
# Admin endpoints — authentication required
# ---------------------------------------------------------------------------

@pytest.mark.django_db
def test_admin_list_requires_staff(api_client):
    """Admin list returns 401/403 for anonymous users."""
    url = reverse('list-admin-blog-posts')
    response = api_client.get(url)

    assert response.status_code in (401, 403)


@pytest.mark.django_db
def test_admin_list_includes_drafts(admin_client, blog_post, draft_blog_post):
    """Admin list returns both published and draft posts."""
    url = reverse('list-admin-blog-posts')
    response = admin_client.get(url)

    assert response.status_code == 200
    ids = [p['id'] for p in response.data['results']]
    assert blog_post.id in ids
    assert draft_blog_post.id in ids


@pytest.mark.django_db
def test_admin_create_blog_post(admin_client):
    """Admin can create a new blog post."""
    url = reverse('create-blog-post')
    data = {
        'title_es': 'Nuevo artículo',
        'title_en': 'New article',
        'excerpt_es': 'Resumen',
        'excerpt_en': 'Summary',
        'category': 'adopcion',
        'author': 'tuhuella-team',
    }
    response = admin_client.post(url, data, format='json')

    assert response.status_code == 201
    assert response.data['title_es'] == 'Nuevo artículo'
    assert BlogPost.objects.filter(title_es='Nuevo artículo').exists()


@pytest.mark.django_db
def test_admin_retrieve_blog_post(admin_client, blog_post):
    """Admin can retrieve full post detail by ID."""
    url = reverse('retrieve-admin-blog-post', kwargs={'post_id': blog_post.id})
    response = admin_client.get(url)

    assert response.status_code == 200
    assert response.data['id'] == blog_post.id
    assert 'title_es' in response.data
    assert 'title_en' in response.data


@pytest.mark.django_db
def test_admin_update_blog_post(admin_client, blog_post):
    """Admin can partially update a post."""
    url = reverse('update-blog-post', kwargs={'post_id': blog_post.id})
    response = admin_client.patch(url, {'title_es': 'Título actualizado'}, format='json')

    assert response.status_code == 200
    blog_post.refresh_from_db()
    assert blog_post.title_es == 'Título actualizado'


@pytest.mark.django_db
def test_admin_delete_blog_post(admin_client, blog_post):
    """Admin can delete a post."""
    post_id = blog_post.id
    url = reverse('delete-blog-post', kwargs={'post_id': post_id})
    response = admin_client.delete(url)

    assert response.status_code == 204
    assert not BlogPost.objects.filter(id=post_id).exists()


@pytest.mark.django_db
def test_admin_duplicate_blog_post(admin_client, blog_post):
    """Duplicating a post creates a new draft copy."""
    url = reverse('duplicate-blog-post', kwargs={'post_id': blog_post.id})
    response = admin_client.post(url)

    assert response.status_code == 201
    assert response.data['is_published'] is False
    assert '(copia)' in response.data['title_es']
    assert BlogPost.objects.count() == 2


@pytest.mark.django_db
def test_admin_get_json_template(admin_client):
    """JSON template endpoint returns expected structure."""
    url = reverse('blog-json-template')
    response = admin_client.get(url)

    assert response.status_code == 200
    assert 'title_es' in response.data
    assert 'content_json_es' in response.data
    assert '_available_categories' in response.data


@pytest.mark.django_db
def test_admin_create_from_json(admin_client):
    """Admin can create a post from a full JSON payload."""
    url = reverse('create-blog-post-from-json')
    data = {
        'title_es': 'Post desde JSON',
        'title_en': 'Post from JSON',
        'excerpt_es': 'Resumen JSON',
        'excerpt_en': 'JSON Summary',
        'content_json_es': {'intro': 'Hola', 'sections': []},
        'category': 'nutricion',
    }
    response = admin_client.post(url, data, format='json')

    assert response.status_code == 201
    assert response.data['title_es'] == 'Post desde JSON'
    assert BlogPost.objects.filter(title_es='Post desde JSON').exists()


@pytest.mark.django_db
def test_admin_calendar_returns_posts_in_range(admin_client, blog_post):
    """Calendar endpoint returns posts within the date range."""
    pub_date = blog_post.published_at
    start = (pub_date.date()).isoformat()
    end = (pub_date.date()).isoformat()
    url = reverse('blog-calendar')

    response = admin_client.get(url, {'start': start, 'end': end})

    assert response.status_code == 200
    ids = [p['id'] for p in response.data]
    assert blog_post.id in ids


@pytest.mark.django_db
def test_admin_calendar_missing_params_returns_400(admin_client):
    """Calendar endpoint requires start and end params."""
    url = reverse('blog-calendar')
    response = admin_client.get(url)

    assert response.status_code == 400


@pytest.mark.django_db
def test_regular_user_cannot_access_admin_endpoints(authenticated_client):
    """Non-staff users get 403 on admin endpoints."""
    url = reverse('list-admin-blog-posts')
    response = authenticated_client.get(url)

    assert response.status_code == 403
