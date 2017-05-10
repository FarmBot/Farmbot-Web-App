describe Api::PointsController do
  describe("#show") do
    it 'renders a tool slot' do
      sign_in user
      payload = { id: tool_slot.id }
      get :show, params: payload
      expect(response.status).to eq(200)
      expect(json[:id]).to eq(tool_slot.id)
      expect(json[:tool_id]).to eq(tool_slot.tool_id)
      expect(json[:name]).to eq(tool_slot.point.name)
      expect(json[:x]).to eq(tool_slot.point.x)
      expect(json[:y]).to eq(tool_slot.point.y)
      expect(json[:z]).to eq(tool_slot.point.z)
    end
  end
end
