import json
import os

import requests
from django.http import JsonResponse
from django.shortcuts import redirect, render
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import authenticate, get_user_model, login as auth_login, logout as auth_logout

CHIMERA_API_KEY = os.getenv("CHIMERA_API_KEY")


@csrf_exempt  # replace with proper CSRF handling if needed
def evaluate_essay(request):
    if request.method != "POST":
        return JsonResponse({"error": "POST only"}, status=405)

    try:
        payload = json.loads(request.body.decode("utf-8"))
    except Exception:
        return JsonResponse({"error": "Invalid JSON"}, status=400)

    essay_text = (payload.get("essay") or "").strip()
    task_type = payload.get("task_type", "task2")
    topic = payload.get("topic", "").strip()

    if not essay_text:
        return JsonResponse({"error": "Empty essay"}, status=400)

    if not CHIMERA_API_KEY:
        return JsonResponse({"error": "Missing CHIMERA_API_KEY env var"}, status=500)

    url = "https://openrouter.ai/api/v1/chat/completions"

    headers = {
        "Authorization": f"Bearer {CHIMERA_API_KEY}",
        "Content-Type": "application/json",
    }

    body = {
        "model": "tngtech/deepseek-r1t2-chimera:free",
        "messages": [
            {
                "role": "system",
                "content": (
                    "You are an IELTS examiner. "
                    "Give band scores for Task Achievement, Coherence and Cohesion, "
                    "Lexical Resource, and Grammatical Range and Accuracy, "
                    "then an overall band based on IELTS writing marking criteria. At the end, you can add a little feedback for improvement"
                    "Be concise, bullet-pointed, no extra chatter."
                ),
            },
            {
                "role": "user",
                "content": f"Task type: {task_type}\n\nTopic: {topic}\n\nEssay:\n{essay_text}",
            },
        ],
    }

    try:
        resp = requests.post(url, headers=headers, json=body, timeout=60)
        resp.raise_for_status()
        result = resp.json()
        feedback = result["choices"][0]["message"]["content"]
        return JsonResponse({"feedback": feedback})
    except requests.HTTPError as http_err:
        return JsonResponse({"error": f"Upstream error: {http_err.response.text}"}, status=502)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


def login(request):
    if request.method == "POST":
        username = request.POST.get("username", "").strip()
        password = request.POST.get("password", "")

        errors = {}
        if not username:
            errors["username"] = "Username is required."
        if not password:
            errors["password"] = "Password is required."

        user = None
        if not errors:
            user = authenticate(request, username=username, password=password)
            if user is None:
                errors["general"] = "Invalid credentials. Please try again."

        if errors:
            return render(
                request,
                "login.html",
                {"errors": errors, "form_values": {"username": username}},
            )

        auth_login(request, user)
        return redirect("main")

    return render(request, "login.html")


def main(request):
    if not request.user.is_authenticated:
        return redirect("login")
    return render(request, "main.html")


def signup(request):
    User = get_user_model()

    if request.method == "POST":
        first_name = request.POST.get("first_name", "").strip()
        last_name = request.POST.get("last_name", "").strip()
        username = request.POST.get("username", "").strip()
        password = request.POST.get("password", "")

        errors = {}

        if not first_name:
            errors["first_name"] = "Name is required."
        if not last_name:
            errors["last_name"] = "Surname is required."
        if not username:
            errors["username"] = "Account is required."
        elif User.objects.filter(username=username).exists():
            errors["username"] = "This account already exists."
        if not password:
            errors["password"] = "Password is required."
        elif len(password) < 6:
            errors["password"] = "Password must be at least 6 characters."

        if errors:
            return render(
                request,
                "signup.html",
                {
                    "errors": errors,
                    "form_values": {
                        "first_name": first_name,
                        "last_name": last_name,
                        "username": username,
                    },
                },
            )

        user = User.objects.create_user(
            username=username,
            password=password,
            first_name=first_name,
            last_name=last_name,
        )
        auth_login(request, user)
        return redirect("main")

    return render(request, "signup.html")


def logout_view(request):
    auth_logout(request)
    return redirect("login")