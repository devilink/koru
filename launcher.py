import tkinter as tk
from tkinter import ttk, messagebox
import subprocess
import socket
import os
import signal
import sys
import atexit

class LauncherApp:
    def __init__(self, root):
        self.root = root
        self.root.title("Companion Bot Launcher")
        self.root.geometry("400x300")
        self.root.configure(padx=20, pady=20)
        
        self.processes = []
        self.is_running = False
        
        # Get local IP
        self.local_ip = self.get_local_ip()
        
        # UI Setup
        title_label = ttk.Label(root, text="Companion Bot", font=("Helvetica", 18, "bold"))
        title_label.pack(pady=(0, 10))
        
        ip_frame = ttk.LabelFrame(root, text="Mobile Connection IP", padding=10)
        ip_frame.pack(fill="x", pady=10)
        
        self.ip_label = ttk.Label(ip_frame, text=self.local_ip, font=("Courier", 16, "bold"), foreground="blue")
        self.ip_label.pack()
        
        self.status_label = ttk.Label(root, text="Status: Stopped", font=("Helvetica", 12))
        self.status_label.pack(pady=10)
        
        self.toggle_btn = ttk.Button(root, text="START", command=self.toggle_services, style="Toggle.TButton")
        self.toggle_btn.pack(pady=10, ipadx=20, ipady=10)
        
        # Style
        style = ttk.Style()
        style.configure("Toggle.TButton", font=("Helvetica", 14, "bold"))
        
        atexit.register(self.stop_services)
        self.root.protocol("WM_DELETE_WINDOW", self.on_close)

    def get_local_ip(self):
        try:
            # Connect to a dummy external IP to get the correct local interface IP
            s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
            s.connect(("8.8.8.8", 80))
            ip = s.getsockname()[0]
            s.close()
            return ip
        except Exception:
            return "127.0.0.1"

    def toggle_services(self):
        if self.is_running:
            self.stop_services()
            self.toggle_btn.config(text="START")
            self.status_label.config(text="Status: Stopped")
            self.is_running = False
        else:
            self.start_services()
            self.toggle_btn.config(text="STOP")
            self.status_label.config(text="Status: Running")
            self.is_running = True

    def start_services(self):
        # 1. Start Qdrant
        try:
            print("Starting Qdrant...")
            # Using 'docker compose' instead of 'docker-compose' for newer Docker Desktop versions
            subprocess.Popen(["docker", "compose", "up", "-d"], cwd=os.path.dirname(os.path.abspath(__file__)))
        except Exception as e:
            print(f"Warning: Failed to start Qdrant via Docker: {e}")
            messagebox.showwarning("Docker Warning", "Could not start Qdrant automatically. Make sure Docker Desktop is running.")

        # 2. Start API Backend
        try:
            print("Starting API Backend...")
            api_proc = subprocess.Popen(
                [sys.executable, "-m", "uvicorn", "apps.api.main:app", "--host", "0.0.0.0", "--port", "8000"],
                cwd=os.path.dirname(os.path.abspath(__file__))
            )
            self.processes.append(api_proc)
        except Exception as e:
            messagebox.showerror("Backend Error", f"Failed to start Python API: {e}")
            self.stop_services()
            return

        # 3. Start Dashboard
        try:
            print("Starting Dashboard...")
            dashboard_cwd = os.path.join(os.path.dirname(os.path.abspath(__file__)), "apps", "dashboard")
            dash_proc = subprocess.Popen(
                ["npm", "run", "dev"],
                cwd=dashboard_cwd,
                shell=True # needed for npm on windows
            )
            self.processes.append(dash_proc)
        except Exception as e:
            messagebox.showerror("Frontend Error", f"Failed to start React Dashboard: {e}")
            self.stop_services()
            return

    def stop_services(self):
        for p in self.processes:
            try:
                if os.name == 'nt':
                    subprocess.call(['taskkill', '/F', '/T', '/PID', str(p.pid)])
                else:
                    os.killpg(os.getpgid(p.pid), signal.SIGTERM)
            except Exception as e:
                print(f"Failed to kill process {p.pid}: {e}")
        self.processes.clear()

    def on_close(self):
        self.stop_services()
        self.root.destroy()

if __name__ == "__main__":
    root = tk.Tk()
    app = LauncherApp(root)
    root.mainloop()
