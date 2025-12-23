
import redis
import sys
import argparse
import time

# Connect to Redis
r = redis.Redis(host='localhost', port=6379, db=0, decode_responses=True)

# Lua Script for Atomic Confirmation
CONFIRM_SCRIPT = """
local uuid = ARGV[1]
local ticket_id = ARGV[2]
local timestamp = ARGV[3]

local claimed_status = "CLAIMED"

-- Verify the voucher is currently in PENDING state
if redis.call("SISMEMBER", KEYS[2], uuid) == 0 then
    return nil -- Not in pending state, cannot claim (maybe expired or already claimed)
end

local voucher_key = "voucher:" .. uuid
local ticket_key = "ticket:" .. ticket_id

-- 1. Update Voucher Status and set Ticket ID
redis.call("HSET", voucher_key, "status", claimed_status, "ticket_id", ticket_id)

-- 2. Create separate Ticket Hash (for admission/lookup)
redis.call("HSET", ticket_key, 
    "voucher_id", uuid, 
    "status", "VALID", 
    "issued_at", timestamp
)

-- Remove from Pending Set and Timeout ZSet
redis.call("SREM", KEYS[2], uuid)
redis.call("ZREM", KEYS[3], uuid)

-- Add to Claimed Set
redis.call("SADD", KEYS[4], uuid)

return uuid
"""

def confirm_voucher(uuid_to_confirm, ticket_id):
    script = r.register_script(CONFIRM_SCRIPT)
    
    keys = [
        "ignored",
        "vouchers:pending",
        "vouchers:pending_timeouts",
        "vouchers:claimed"
    ]
    
    current_time = int(time.time())
    argv = [uuid_to_confirm, ticket_id, current_time]
    
    result = script(keys=keys, args=argv)
    
    if result:
        print(f"✅ Successfully claimed voucher: {uuid_to_confirm}")
        print(f"   Associated with Ticket: {ticket_id}")
        return True
    else:
        print(f"❌ Failed to claim voucher {uuid_to_confirm}: Not in pending state (expired or invalid).")
        return False

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Confirm a voucher claim.')
    parser.add_argument('uuid', type=str, help='UUID to confirm')
    parser.add_argument('ticket_id', type=str, help='Ticket ID to associate')
    
    args = parser.parse_args()
    
    try:
        confirm_voucher(args.uuid, args.ticket_id)
    except redis.exceptions.ConnectionError:
        print("Error: Could not connect to Redis at localhost:6379")
