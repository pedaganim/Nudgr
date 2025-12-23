
import redis
import time

# Connect to Redis
r = redis.Redis(host='localhost', port=6379, db=0, decode_responses=True)

# Lua Script for Atomic Cleanup of a Single Voucher
# We process them one by one or in batches to avoid blocking Redis for too long
CLEANUP_SCRIPT = """
local uuid = ARGV[1]
local available_status = "AVAILABLE"

-- Double check if it is still in pending set (race condition check)
if redis.call("SISMEMBER", KEYS[2], uuid) == 0 then
    return 0
end

local voucher_key = "voucher:" .. uuid

-- Update Status
redis.call("HSET", voucher_key, "status", available_status)

-- Remove from Pending Set and Timeout ZSet
redis.call("SREM", KEYS[2], uuid)
redis.call("ZREM", KEYS[3], uuid)

-- Add back to Available Set
redis.call("SADD", KEYS[4], uuid)

return 1
"""

def cleanup_expired_reservations():
    script = r.register_script(CLEANUP_SCRIPT)
    now = int(time.time())
    
    # Get expired UUIDs from ZSET
    # ZRANGEBYSCORE key -inf current_timestamp
    expired_uuids = r.zrangebyscore("vouchers:pending_timeouts", "-inf", now)
    
    if not expired_uuids:
        print("No expired reservations found.")
        return

    print(f"Found {len(expired_uuids)} expired reservations. Cleaning up...")
    
    count = 0
    keys = [
        "ignored",
        "vouchers:pending",
        "vouchers:pending_timeouts",
        "vouchers:available"
    ]
    
    for uuid in expired_uuids:
        argv = [uuid]
        if script(keys=keys, args=argv):
            print(f"  - Released {uuid} back to available.")
            count += 1
            
    print(f"Cleanup complete. Released {count} vouchers.")

if __name__ == "__main__":
    try:
        cleanup_expired_reservations()
    except redis.exceptions.ConnectionError:
        print("Error: Could not connect to Redis at localhost:6379")
