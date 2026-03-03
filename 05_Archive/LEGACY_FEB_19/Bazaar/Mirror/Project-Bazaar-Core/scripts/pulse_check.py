import subprocess
import datetime
import os

LOG_FILE = "/home/pinoyq8/Project-Bazaar-Core/logs/sentinel_pulse.log"

def check_node():
    timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    try:
        # Check if the pi-node container is running
        result = subprocess.check_output(["docker", "ps", "--filter", "name=pi-node", "--format", "{{.Status}}"])
        status = result.decode("utf-8").strip()
        
        if "Up" in status:
            log_entry = f"[{timestamp}] SHIELD: ACTIVE | Status: {status}\n"
        else:
            log_entry = f"[{timestamp}] SHIELD: WARNING | Node is DOWN or Restarting!\n"
    except Exception as e:
        log_entry = f"[{timestamp}] SHIELD: CRITICAL | Docker Error: {str(e)}\n"

    with open(LOG_FILE, "a") as f:
        f.write(log_entry)
    print(log_entry.strip())

if __name__ == "__main__":
    check_node()
