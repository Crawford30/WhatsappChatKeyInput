import { useState } from "react";
import { irasStyles as styles } from "../style/iras/irasStyles";
import { Text, View } from "react-native";
import { Switch } from "react-native-paper";

export const GenericSwitch = ({
  label,
  labelStyle,
  value,
  onValueChange,
}: any) => {
  const [isSwitchOn, setIsSwitchOn] = useState<any>(value);

  const onToggleSwitch = (value: any) => {
    setIsSwitchOn(!isSwitchOn);
    if (onValueChange) onValueChange(value);
  };

  return (
    <View style={[styles.flexRow, styles.flexNullCenter]}>
      <Text style={labelStyle}>{label}</Text>
      <Switch
        style={{ height: 20 }}
        value={isSwitchOn}
        onValueChange={onToggleSwitch}
      />
    </View>
  );
};
