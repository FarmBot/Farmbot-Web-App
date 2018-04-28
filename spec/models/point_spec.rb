describe Point do
  it "detects infinity" do
    expect(Point.new(x: (1.0/0.0)).is_infinite?).to be true
    expect(Point.new(y: (1.0/0.0)).is_infinite?).to be true
    expect(Point.new(z: (1.0/0.0)).is_infinite?).to be true
    expect(Point.new(x: 1, y: 1000, z: -2).is_infinite?).to be false
  end
end
