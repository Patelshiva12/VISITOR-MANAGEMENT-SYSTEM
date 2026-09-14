import os
import sys
import subprocess

if __name__ == "__main__":
    base_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(base_dir)
    sys.path.insert(0, base_dir)

    # Allow custom port from argv, env, or default to 8080 (since 8000 and 8001 are in use by other apps)
    port = sys.argv[1] if len(sys.argv) > 1 else os.getenv('PORT', '8080')


    print("=" * 60)
    print(">> Starting ILIZIEN VMS Django Backend Server...")
    print(">> Framework: Django 5.2 + Django REST Framework")
    print(f">> API Base URL: http://localhost:{port}/api/v1/")
    print(f">> Admin Console: http://localhost:{port}/admin/")
    print("=" * 60)

    # 1. Run migrations
    print(">> Applying database migrations...")
    subprocess.run([sys.executable, "manage.py", "makemigrations", "vms_api"], check=False)
    subprocess.run([sys.executable, "manage.py", "migrate"], check=False)

    # 2. Seed database
    print(">> Verifying/Seeding default demo data...")
    subprocess.run([sys.executable, "manage.py", "seed_db"], check=False)

    # 3. Start server
    print(f">> Server running on http://127.0.0.1:{port} ...")
    subprocess.run([sys.executable, "manage.py", "runserver", f"127.0.0.1:{port}"])


