/* eslint-disable max-len */

const FROM_FBOS = `
function grid(params)
  local x_point_count = params.grid_points.x
  local y_point_count = params.grid_points.y
  local z_point_count = params.grid_points.z
  local x_grid_max_index = x_point_count - 1
  local y_grid_max_index = y_point_count - 1
  local z_grid_max_index = z_point_count - 1
  local start_time = os.time() * 1000

  params.start = params.start or { x = 0, y = 0, z = 0 }
  params.offset = params.offset or { x = 0, y = 0, z = 0 }

  local x = function(x_index)
    return (params.start.x + (params.spacing.x * x_index) - params.offset.x)
  end
  local y = function(y_index)
    return (params.start.y + (params.spacing.y * y_index) - params.offset.y)
  end
  local z = function(z_index)
    return (params.start.z + (params.spacing.z * z_index) - params.offset.z)
  end

  local grid_max_x = x(x_grid_max_index)
  local grid_max_y = y(y_grid_max_index)
  local grid_max_z = z(z_grid_max_index)
  local x_max = garden_size().x
  local y_max = garden_size().y
  local z_max = garden_size().z

  local size_exceeded = ""
  if x_max > 0 and grid_max_x > x_max then
    size_exceeded = size_exceeded .. math.floor(grid_max_x) .. "mm exceeds " .. x_max .. "mm x-axis length. "
  end
  if y_max > 0 and grid_max_y > y_max then
    size_exceeded = size_exceeded .. math.floor(grid_max_y) .. "mm exceeds " .. y_max .. "mm y-axis length. "
  end
  if z_max > 0 and grid_max_z > z_max then
    size_exceeded = size_exceeded .. math.floor(grid_max_z) .. "mm exceeds " .. z_max .. "mm z-axis length. "
  end

  if not params.ignore_empty and (x_point_count <= 0 or y_point_count <= 0 or z_point_count <= 0) then
      toast("Number of points must be greater than 0 for all three axes", "error")
      return
  elseif not params.ignore_bounds and #size_exceeded > 0 then
      toast("Grid must not exceed the **AXIS LENGTH** for any axes: " .. size_exceeded, "error")
      return
  end

  local each = function(callback)
    local count = 0
    for z_grid_index = 0, z_grid_max_index do
      for x_grid_index = 0, x_grid_max_index do
        for y_grid_index = 0, y_grid_max_index do
          count = count + 1
          local y_grid_index_var
          if (x_grid_index % 2) == 0 then
              y_grid_index_var = y_grid_index
          else
              y_grid_index_var = y_grid_max_index - y_grid_index
          end
          callback({
            x = x(x_grid_index),
            y = y(y_grid_index_var),
            z = z(z_grid_index),
            count = count,
          })
        end
      end
    end
  end

  return {
    total = x_point_count * y_point_count * z_point_count,
    each = each,
  }
end

function round(n) return math.floor(n + 0.5) end

function angleRound(angle)
    local remainder = math.abs(angle % 90)
    if remainder > 45 then
        return 90 - remainder
    else
        return remainder
    end
end

-- Returns an integer that we need to subtract from width/height
-- due to camera rotation issues.
function cropAmount(width, height, angle)
    local absAngle = angleRound(angle or 0)
    if (absAngle > 0) then
        local x = (5.61 - 0.095 * math.pow(absAngle, 2) + 9.06 * absAngle)
        local factor = x / 640
        local longEdge = math.max(width, height)
        local result = round(longEdge * factor)
        return result
    end
    return 0
end

function fwe(key)
    local e = env("CAMERA_CALIBRATION_" .. key)
    if e then
        return tonumber(e)
    else
        return nil
    end
end

function photo_grid()
  local cam_rotation = fwe("total_rotation_angle") or 0
  local scale = fwe("coord_scale") or 1
  local z = fwe("camera_z") or 0
  local x_offset_mm = fwe("camera_offset_x") or 0
  local y_offset_mm = fwe("camera_offset_y") or 0
  local center_pixel_location_x = fwe("center_pixel_location_x") or 320
  local center_pixel_location_y = fwe("center_pixel_location_y") or 240
  local full_grid, x_spacing_mm, y_spacing_mm, x_grid_start_mm, y_grid_start_mm
  local x_grid_size_mm, y_grid_size_mm, x_grid_points, y_grid_points
  if cam_rotation and scale and z and x_offset_mm and
     y_offset_mm and center_pixel_location_x and center_pixel_location_y then
    local raw_img_size_x_mm = center_pixel_location_x * 2 * scale
    local raw_img_size_y_mm = center_pixel_location_y * 2 * scale
    local margin_mm = cropAmount(raw_img_size_x_mm, raw_img_size_y_mm, cam_rotation)
    local cropped_img_size_x_mm = raw_img_size_x_mm - margin_mm - 5
    local cropped_img_size_y_mm = raw_img_size_y_mm - margin_mm - 5
    if math.abs(cam_rotation) < 45 then
        x_spacing_mm = cropped_img_size_x_mm
        y_spacing_mm = cropped_img_size_y_mm
    else
        x_spacing_mm = cropped_img_size_y_mm
        y_spacing_mm = cropped_img_size_x_mm
    end
    x_spacing_mm = math.max(10, x_spacing_mm)
    y_spacing_mm = math.max(10, y_spacing_mm)
    x_grid_size_mm = garden_size().x - x_spacing_mm
    y_grid_size_mm = garden_size().y - y_spacing_mm
    x_grid_points = math.ceil(x_grid_size_mm / x_spacing_mm) + 1
    y_grid_points = math.ceil(y_grid_size_mm / y_spacing_mm) + 1
    x_grid_start_mm = (x_spacing_mm / 2)
    y_grid_start_mm = (y_spacing_mm / 2)

    full_grid = grid{
      grid_points = {
        x = x_grid_points,
        y = y_grid_points,
        z = 1,
      },
      start = {
        x = x_grid_start_mm,
        y = y_grid_start_mm,
        z = z,
      },
      spacing = {
        x = x_spacing_mm,
        y = y_spacing_mm,
        z = 0,
      },
      offset = {
        x = x_offset_mm,
        y = y_offset_mm,
        z = 0,
      },
      ignore_bounds = true,
    }
  else
    toast("You must first run camera calibration", "error")
  end

  full_grid = full_grid or grid{
    grid_points = { x = 0, y = 0, z = 0 },
    spacing = { x = 0, y = 0, z = 0 },
    ignore_empty = true,
  }

  local each = function(callback)
    full_grid.each(function(cell)
      callback({ x = cell.x, y = cell.y, z = cell.z, count = cell.count })
    end)
  end

  return {
      y_spacing_mm = y_spacing_mm,
      y_offset_mm = y_offset_mm,
      y_grid_start_mm = y_grid_start_mm,
      y_grid_size_mm = y_grid_size_mm,
      y_grid_points = y_grid_points,
      x_spacing_mm = x_spacing_mm,
      x_offset_mm = x_offset_mm,
      x_grid_start_mm = x_grid_start_mm,
      x_grid_size_mm = x_grid_size_mm,
      x_grid_points = x_grid_points,
      z = z,
      total = full_grid.total,
      each = each,
  }
end

function dismount_tool()
    local tool_id = get_device("mounted_tool_id")
    local start_time = os.time() * 1000

    -- Checks
    if not tool_id then
        toast("No tool is mounted to the UTM", "error")
        return
    end
    if not verify_tool() then
        return
    end

    -- Get all points
    local points = api({ url = "/api/points/" })
    if not points then
        toast("API error", "error")
        return
    end

    -- Pluck the tool slot point where the currently mounted tool belongs
    local slot
    local slot_dir
    for key, point in pairs(points) do
        if point.tool_id == tool_id then
            slot = point
            slot_dir = slot.pullout_direction
        end
    end

    -- Get tool name
    local tool_name = get_tool{id = tool_id}.name

    -- Checks
    if not slot then
        toast("No slot found for the currently mounted tool (" .. tool_name .. ") - check the Tools panel", "error")
        return
    elseif slot_dir == 0 then
        toast("Tool slot must have a direction", "error")
        return
    elseif slot.gantry_mounted then
        toast("Tool slot cannot be gantry mounted", "error")
        return
    end

    -- Job progress tracking
    function job(percent, status)
        set_job_progress(
            "Dismounting " .. tool_name,
            { percent = percent, status = status, time = start_time }
        )
    end

    -- Safe Z move to the front of the slot
    job(20, "Retracting Z")
    move{z = safe_z()}

    job(40, "Moving to front of slot")
    if slot_dir == 1 then
        move{x = slot.x + 100, y = slot.y}
    elseif slot_dir == 2 then
        move{x = slot.x - 100, y = slot.y}
    elseif slot_dir == 3 then
        move{x = slot.x, y = slot.y + 100}
    elseif slot_dir == 4 then
        move{x = slot.x, y = slot.y - 100}
    end

    job(60, "Lowering Z")
    move{z = slot.z}

    -- Put the tool in the slot
    job(80, "Putting tool in slot")
    move_absolute(slot.x, slot.y, slot.z, 50)

    -- Dismount tool
    job(90, "Dismounting tool")
    move{z = slot.z + 50}

    -- Check verification pin
    if read_pin(63) == 0 and false then
        job(90, "Failed")
        toast("Tool dismounting failed - there is still an electrical connection between UTM pins B and C.", "error")
        return
    else
        job(100, "Complete")
        update_device({mounted_tool_id = 0})
        toast(tool_name .. " dismounted", "success")
    end
end

function dispense(ml, params)
    params = params or {}
    local tool_name = params.tool_name or "Watering Nozzle"
    local pin_number = params.pin or 8

    -- Get flow_rate
    local tool = get_tool{name = tool_name}
    if not tool then
        toast('Tool "' .. tool_name .. '" not found', 'error')
        return
    end
    local flow_rate = tool.flow_rate_ml_per_s

    -- Checks
    if not flow_rate then
        toast('You must have a tool named "' .. tool_name .. '" to use this sequence.', 'error')
        return
    elseif flow_rate == 0 then
        toast("**FLOW RATE (mL/s)** must be greater than 0 for the " .. tool_name .. " tool.", "error")
        return
    elseif ml <= 0 then
        toast("Liquid volume was 0mL. Skipping.", "warn")
        return
    elseif ml > 10000 then
        toast("Liquid volume cannot be more than 10,000mL", "error")
        return
    end

    local seconds = math.floor(ml / flow_rate * 10) / 10
    local status = "Dispensing"
    local job_message = status .. " " .. ml .. "mL"
    local log_message = job_message .. " over " .. seconds .. " seconds"

    -- Action
    send_message("info", log_message)
    on(pin_number)
    wait(seconds * 1000, {
        job = job_message,
        status = status,
    })
    off(pin_number)
end

function get_curve(curve_id)
  local api_curve_data = api({ url = "/api/curves/" .. curve_id })
  if not api_curve_data then
      toast("API error. Is your curve ID correct?", "error")
      return
  end

  function get_day_value(day)
    local day = tonumber(day)
    local day_string = tostring(day)
    local value = api_curve_data.data[day_string]
    if value ~= nil then
      return value
    end

    local data_days = {}
    local i = 0
    for day_key, _ in pairs(api_curve_data.data) do
      i = i + 1
      data_days[i] = tonumber(day_key)
    end
    table.sort(data_days)

    local greater_days = {}
    local i = 0
    for _, k in pairs(data_days) do
      if k > day then
        i = i + 1
        greater_days[i] = k
      end
    end
    table.sort(greater_days)

    local lesser_days = {}
    local i = 0
    for _, k in pairs(data_days) do
      if k < day then
        i = i + 1
        lesser_days[i] = k
      end
    end
    table.sort(lesser_days)

    local prev_day = lesser_days[#lesser_days]
    local next_day = greater_days[1]

    if prev_day == nil then
      local first_day = tostring(math.floor(data_days[1]))
      return api_curve_data.data[first_day]
    end

    if next_day == nil then
      local last_day = tostring(math.floor(data_days[#data_days]))
      return api_curve_data.data[last_day]
    end

    local prev_value = api_curve_data.data[tostring(math.floor(prev_day))]
    local next_value = api_curve_data.data[tostring(math.floor(next_day))]

    local exact_value = (prev_value * (next_day - day) + next_value * (day - prev_day))
      / (next_day - prev_day)
    return tonumber(string.format("%.2f", exact_value))
  end

  local unit
  if api_curve_data.type == "water" then
    unit = "mL"
  else
    unit = "mm"
  end

  local curve = {
    name = api_curve_data.name,
    type = api_curve_data.type,
    unit = unit,
    day = get_day_value,
  }

  return curve
end

function get_seed_tray_cell(tray, tray_cell)
  local cell = string.upper(tray_cell)
  local seeder_needle_offset = 17.5
  local cell_spacing = 12.5
  local cells = {
      A1 = {label = "A1", x = 0, y = 0},
      A2 = {label = "A2", x = 0, y = 1},
      A3 = {label = "A3", x = 0, y = 2},
      A4 = {label = "A4", x = 0, y = 3},
      B1 = {label = "B1", x = -1, y = 0},
      B2 = {label = "B2", x = -1, y = 1},
      B3 = {label = "B3", x = -1, y = 2},
      B4 = {label = "B4", x = -1, y = 3},
      C1 = {label = "C1", x = -2, y = 0},
      C2 = {label = "C2", x = -2, y = 1},
      C3 = {label = "C3", x = -2, y = 2},
      C4 = {label = "C4", x = -2, y = 3},
      D1 = {label = "D1", x = -3, y = 0},
      D2 = {label = "D2", x = -3, y = 1},
      D3 = {label = "D3", x = -3, y = 2},
      D4 = {label = "D4", x = -3, y = 3}
  }

  -- Checks
  if tray.pointer_type ~= "ToolSlot" then
      toast("Seed Tray variable must be a seed tray in a slot", "error")
      return
  elseif not cells[cell] then
      toast("Seed Tray Cell must be one of **A1** through **D4**", "error")
      return
  end

  -- Flip X offsets depending on pullout direction
  local flip = 1
  if tray.pullout_direction == 1 then
      flip = 1
  elseif tray.pullout_direction == 2 then
      flip = -1
  else
      send_message("error", "Seed Tray **SLOT DIRECTION** must be \`Positive X\` or \`Negative X\`")
      return
  end

  -- A1 coordinates
  local A1 = {
      x = tray.x - seeder_needle_offset + (1.5 * cell_spacing * flip),
      y = tray.y - (1.5 * cell_spacing * flip),
      z = tray.z
  }

  -- Cell offset from A1
  local offset = {
      x = cell_spacing * cells[cell].x * flip,
      y = cell_spacing * cells[cell].y * flip
  }

  -- Return cell coordinates
  return {
      x = A1.x + offset.x,
      y = A1.y + offset.y,
      z = A1.z
  }
end

function mount_tool(input)
    local slot
    if type(input) == "string" then
      local prelim_tool
      local tool_name = input
      prelim_tool = get_tool{name = tool_name}
      if not prelim_tool then
          toast("'" .. tool_name .. "' tool not found", "error")
          return
      end

      local points = api({ url = "/api/points/" })
      if not points then
          toast("API error", "error")
          return
      end
      for key, point in pairs(points) do
        if point.tool_id == prelim_tool.id then
          slot = point
        end
      end
    else
      slot = input
    end

    if not slot then
      toast("Tool slot not found", "error")
      return
    end

    local slot_dir = slot.pullout_direction
    local start_time = os.time() * 1000

    -- Checks
    if read_pin(63) == 0 then
        toast("A tool is already mounted to the UTM - there is an electrical connection between UTM pins B and C.", "error")
        return
    elseif get_device("mounted_tool_id") then
        toast("There is already a tool mounted to the UTM - check the **MOUNTED TOOL** dropdown in the Tools panel.", "error")
        return
    elseif slot.pointer_type ~= "ToolSlot" then
        toast("Provided location must be a tool in a slot", "error")
        return
    elseif slot_dir == 0 then
        toast("Tool slot must have a direction", "error")
        return
    elseif slot.gantry_mounted then
        toast("Tool slot cannot be gantry mounted", "error")
        return
    end

    local tool = get_tool{id = slot.tool_id}
    if not tool then
        toast("Tool slot must have a tool", "error")
        return
    end

    -- Job progress tracking
    function job(percent, status)
        set_job_progress(
            "Mounting " .. tool.name,
            { percent = percent, status = status, time = start_time }
        )
    end

    -- Safe Z move to above the tool
    job(20, "Retracting Z")
    move{z=safe_z()}
    job(40, "Moving above tool")
    move{x=slot.x, y=slot.y}

    -- Mount the tool
    job(60, "Mounting tool")
    move{z=slot.z}

    -- Pull the tool out of the slot at 50% speed
    job(80, "Pulling tool out")
    if slot_dir == 1 then
        move_absolute(slot.x + 100, slot.y, slot.z, 50)
    elseif slot_dir == 2 then
        move_absolute(slot.x - 100, slot.y, slot.z, 50)
    elseif slot_dir == 3 then
        move_absolute(slot.x, slot.y + 100, slot.z, 50)
    elseif slot_dir == 4 then
        move_absolute(slot.x, slot.y - 100, slot.z, 50)
    end

    -- Check verification pin
    if read_pin(63) == 1 and false then
        job(80, "Failed")
        toast("Tool mounting failed - no electrical connection between UTM pins B and C.", "error")
        return
    else
        job(100, "Complete")
        update_device({mounted_tool_id = slot.tool_id})
        toast(tool.name .. " mounted", "success")
    end
end

function axis_overwrite(axis, num)
    return {
        kind = "axis_overwrite",
        args = {
            axis = axis,
            axis_operand = {kind = "numeric", args = {number = num}}
        }
    }
end

function speed_overwrite(axis, num)
    return {
        kind = "speed_overwrite",
        args = {
            axis = axis,
            speed_setting = {kind = "numeric", args = {number = num}}
        }
    }
end

function re_move(input)
    cs_eval({
        kind = "rpc_request",
        args = {label = "move_cmd_lua", priority = 500},
        body = {
            {
                kind = "move",
                args = {},
                body = {
                    input.x and axis_overwrite("x", input.x),
                    input.y and axis_overwrite("y", input.y),
                    input.z and axis_overwrite("z", input.z),
                    input.speed and speed_overwrite("x", input.speed),
                    input.speed and speed_overwrite("y", input.speed),
                    input.speed and speed_overwrite("z", input.speed),
                    input.safe_z and {kind = "safe_z", args = {}}
                }
            }
        }
    })
end

function rpc(rpc_node)
    local label = "" .. math.random() .. math.random();
    return cs_eval({
        kind = "rpc_request",
        args = {label = label},
        body = {rpc_node}
    })
end

function sequence(sequence_id, params)
    if not params then
        return rpc({
            kind = "execute",
            args = {sequence_id = sequence_id}
        })
    end
    local body = {}
    local i = 0
    for key, data_value in pairs(params) do
        i = i + 1
        body[i] = {
            kind = "parameter_application",
            args = {label = key, data_value = data_value}
        }
    end
    return rpc({
        kind = "execute",
        args = {sequence_id = sequence_id},
        body = body
    })
end

function verify_tool()
  local mounted_tool_id = get_device("mounted_tool_id")

  if read_pin(63) == 1 then
      toast("No tool detected on the UTM - there is no electrical connection between UTM pins B and C.", "error")
      return false
  end

  if not mounted_tool_id then
      toast("A tool is mounted but FarmBot does not know which one - check the **MOUNTED TOOL** dropdown in the Tools panel.", "error")
      return false
  end

  local mounted_tool_name = get_tool{id = mounted_tool_id}.name
  send_message("success", "The " .. mounted_tool_name .. " is mounted on the UTM")
  return true
end

function wait(milliseconds, params)
  params = params or {}
  local seconds = milliseconds / 1000
  local job = params.job or "Waiting " .. seconds .. "s"
  local status = params.status or "Waiting"
  local start_time = os.time() * 1000

  if milliseconds < 1000 then
    wait_ms(milliseconds)
  else
    for i = 1, seconds do
      set_job_progress(job, {
        percent = math.floor((i - 1) / seconds * 100),
        status = status,
        time = start_time,
      })
      wait_ms(1000)
    end
    wait_ms(milliseconds % 1000)
    set_job_progress(job, {
      percent = 100,
      status = "Complete",
      time = start_time,
    })
  end
end

function water(plant, params)
    local plant_name_xy = plant.name .. " at (" .. plant.x .. ", " .. plant.y .. ")"
    local job_name = "Watering " .. plant_name_xy

    if not plant.age and not plant.planted_at then
        toast(plant_name_xy .. " has not been planted yet. Skipping.", "warn")
        return
    end

    if plant.age then
      plant_age = plant.age
    else
      plant_age = math.ceil((os.time() - to_unix(plant.planted_at)) / 86400)
    end

    -- Get water curve and water amount in mL
    local water_curve, water_ml
    if plant.water_curve_id then
        water_curve = get_curve(plant.water_curve_id)
        water_ml = water_curve.day(plant_age)
    else
        toast(plant_name_xy .. " has no assigned water curve. Skipping.", "warn")
        return
    end

    -- Move to the plant
    set_job(job_name, { status = "Moving" })
    move{ x = plant.x, y = plant.y, z = safe_z() }

    -- Water the plant
    set_job(job_name, { status = "Watering", percent = 50 })
    send_message("info", "Watering " .. plant_age .. " day old " .. plant_name_xy .. " " .. water_ml .. "mL")
    dispense(water_ml, params)
    complete_job(job_name)
end
`;

const ALIASES = `
function on(pin)
  write_pin(pin, "digital", 1)
end

function off(pin)
  write_pin(pin, "digital", 0)
end

function toast(message, type)
  local type = type or "info"
  send_message(type, message, "toast")
end

function debug(message)
  send_message("debug", message)
end

function iso8601(date)
  return string.format("%04d-%02d-%02dT%02d:%02d:%02dZ",
    date.year, date.month, date.day,
    date.hour, date.min, date.sec)
end

function utc(part)
  local now = os.date("*t")
  local map = {
    year = now.year,
    month = now.month,
    day = now.day,
    hour = now.hour,
    minute = now.min,
    second = now.sec,
  }
  return map[part] or iso8601(now)
end

function current_year()
  return utc("year")
end

function current_month()
  return utc("month")
end

function current_day()
  return utc("day")
end

function current_hour()
  return utc("hour")
end

function current_minute()
  return utc("minute")
end

function current_second()
  return utc("second")
end

function get_tool(params)
  local tool_id = params.id or 0
  local tool_name = params.name or ""
  local tools = api({ url = "/api/tools" })
  tools = tools or {}
  for _, tool in ipairs(tools) do
    if tool.id == tool_id or tool.name == tool_name then
      return tool
    end
  end
  return nil
end
`;

export const LUA_HELPERS = [
  ALIASES,
  FROM_FBOS,
].join("\n");
