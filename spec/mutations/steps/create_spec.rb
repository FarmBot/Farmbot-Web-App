require 'spec_helper'

describe Steps::Create do
  let(:user) { FactoryGirl.create(:user) }
  let(:mutation) { Steps::Create }
  let(:valid_params) { {message_type: 'move_rel',
                        sequence: FactoryGirl.create(:sequence),
                        command: {action: 'MOVE RELATIVE',
                                  x: 1,
                                  y: 2,
                                  z: 3,
                                  speed: 100,
                                  delay: 0}} }

  it 'Builds an instance of `step`' do
    outcome = mutation.run(valid_params)
    expect(outcome.success?).to be_truthy
    expect(outcome.result.message_type).to eq(valid_params[:message_type])
    expect(outcome.result.sequence).to eq(valid_params[:sequence])
    cmd = outcome.result.command.deep_symbolize_keys
    expect(cmd).to eq(valid_params[:command])
  end

  it 'Returns 422 for bad records' do
    # curl 'http://localhost:3000/api/sequences/54ba75d8736d610b07000000/steps' -H 'Cookie: _ga=GA1.1.930394941.1409052865; _dss_session=Y0FnWFVPeXFpVVFiTG9pM1luejVvVzJnbEsrU01LOWZwNUdyWSs1SXgvRGRUbjNYc2ptNU1ZeUZMK3hiQ0dWWWRvU2VjNUtJaTNRSmpMQUNQbU9ISWlkOUlCSVZxWk1tYkxlbGdTeDJ0UVNCT3NTZ2E2bC94NlJIYnQyZjkvcThBbHpudXZ3RzZrL0NPTUN1Z0daeGVqbldvWHk4clVSNnF4WnR2N0phYS85bC95Rlc1bi9PWkVmZVQrbmtsTE5aVHR4eEMzcUd1SDNva1M3OVAzMHd5TFZFQ1AzdkM3ZGpUMVlUUTZoeDhSOERsNWcwc2JvdENJblhNTkh0VHJxNFdtQkxSdlR0WlJYL0FlUFQvY1h1ZHp0UFI4aGl6dTNxODRQUTRVU1grTzM2R010QWorQTFkb2o5R05WempuTEQtLVdSSW1mR1dGK2Z3VGxZRGZBVnI4dmc9PQ%3D%3D--5f8e7b1d49c3a21ccdf41d9e38436bdc71fd8cb9' -H 'Origin: http://localhost:3000' -H 'Accept-Encoding: gzip, deflate' -H 'X-CSRF-TOKEN: GVfkmmcVJIe8HTo5oeeRYkYoyF+WGMlMWfHSgI13+3I=' -H 'Accept-Language: en-US,en;q=0.8,ko;q=0.6' -H 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.99 Safari/537.36' -H 'Content-Type: application/json;charset=UTF-8' -H 'Accept: application/json, text/plain, */*' -H 'Referer: http://localhost:3000/dashboard' -H 'X-Requested-With: XMLHttpRequest' -H 'Connection: keep-alive' --data-binary '{"message_type":"move_rel","sequence_id":"54ba75d8736d610b07000000"}' --compressed
  end
end
